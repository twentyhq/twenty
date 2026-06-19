import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { XOPURE_SYNC_MAP_OBJECT_ID } from '../objects/xopure-sync-map.object';

export default defineNavigationMenuItem({
  universalIdentifier: 'bd0c8ff9-294e-4bae-a8a1-4a59d9d33d12',
  position: 40,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: XOPURE_SYNC_MAP_OBJECT_ID,
});
