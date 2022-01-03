


module.exports = function Backstab(mod) {
	let enabled = true;
	let bossid
	let bossloc
	let bossw
	let monsters = []
	
	let myPosition = null;
	let myAngle = null;
	let cid;	
	let distance = 150;
	let order = { order: -Infinity, filter: { fake: null } };		
						
	mod.hook('S_LOGIN', 14, event => {			
			cid = event.gameId;
	});
	
	mod.command.add("bdis", (arg) => {
		let t = Number(arg);
		distance = t;
		mod.command.message("Backstab distance set to : " + distance);
	});

	mod.hook('S_SPAWN_NPC', 12, event => {
		if(!enabled) return
		if(mod.game.me.class !== 'sorcerer') return		
		monsters.push({ gameId: event.gameId, loc: event.loc, w: event.w })
	})
	mod.hook('S_BOSS_GAGE_INFO', 3, event => {
		if(!enabled) return
		if(bossid && bossid == event.id) return
		bossid = event.id		
		let monster = monsters.find(m => m.gameId === event.id)
		if (monster) { 
			bossloc = monster.loc
			bossw = monster.w
		}					
	})
	
	mod.hook('S_NPC_LOCATION', 3, event => {
		if(!enabled) return
		let monster = monsters.find(m => m.gameId === event.gameId)
		if (monster) monster.loc = event.loc
		if(bossid == event.gameId) { 
			bossloc = event.loc
			bossw = event.w
		}		
	})
	mod.hook('S_DESPAWN_NPC', 3, event => {
		if(!enabled) return
		monsters = monsters.filter(m => m.gameId != event.gameId)
		if(bossid == event.gameId) { 
			bossid = null
			bossloc = null
			bossw = null
		}	
	})
	mod.hook('S_ACTION_STAGE', 9, order, (event) => {
		if(!enabled) return;
		if(event.gameId === mod.game.me.gameId) {
			myPosition = event.loc;
			myAngle = event.w;
		}
		if(bossid == event.gameId) { 
			bossloc = event.loc
			bossw = event.w
		}
	});	
	mod.hook('S_ACTION_END', 5, order, (event) => {
		if(!enabled) return;
		if(event.gameId === mod.game.me.gameId) {
			myPosition = event.loc;
			myAngle = event.w;
		}
		if(bossid == event.gameId) { 
			bossloc = event.loc
			bossw = event.w
		}		
	});	

	
	mod.hook('C_PLAYER_LOCATION', 5, order, (event) => {
		myPosition = event.loc;
		myAngle = event.w;
	});	
	  
	mod.hook('C_START_TARGETED_SKILL', 7, order, event => {
		if(!enabled) return;
			myAngle = event.w;
			myPosition = event.loc;				
	});	

	mod.hook('C_USE_ITEM', 3, event => {
		if(!enabled) return;
		if(!bossloc) return false
		if(event.id === 6551) {
			backstab(distance,0)
			return false;
		}
	});		


	mod.hook('C_NOTIFY_LOCATION_IN_DASH', 4, order, event => {
		if(!enabled) return;
		myAngle = event.w;
		myPosition = event.loc;				
	})

	mod.hook('C_NOTIFY_LOCATION_IN_ACTION', 4, order, event => {
		if(!enabled) return;
		myAngle = event.w;
		myPosition = event.loc;
		
	})	
	mod.hook('C_START_SKILL', 7, order, event => {
		if(!enabled) return;
		myPosition = event.loc;
		myAngle = event.w;
	});
	mod.hook('C_START_COMBO_INSTANT_SKILL', 6, order, event => {
		if(!enabled) return;
		myPosition = event.loc;
		myAngle = event.w;
	});	
	
	mod.hook('C_PRESS_SKILL', 4, order, event => {
		if(!enabled) return;
		myPosition = event.loc;
		myAngle = event.w;
	});		
	mod.hook('C_START_INSTANCE_SKILL', 7, order, event => {
		if(!enabled) return;
		myPosition = event.loc;
		myAngle = event.w;		

	});
	
	function backstab(d, n) {
		CastBackstab((Math.cos(bossw) * (d*-1)) + bossloc.x, (Math.sin(bossw) * (d*-1)) + bossloc.y, bossloc.z + n, bossw);
	}
	
	function CastBackstab(x, y, z, w = 0) {
		mod.toClient('S_INSTANT_MOVE', 3, {
			gameId: mod.game.me.gameId,
			loc: {x, y, z},
			w: w
		});
	}	
	
}