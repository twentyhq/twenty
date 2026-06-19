import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { XOPURE_SYNC_CURSOR_OBJECT_ID } from '../objects/xopure-sync-cursor.object';

export default defineNavigationMenuItem({
  universalIdentifier: '96d6eb49-ef33-4d9b-b322-290f73524abb',
  position: 41,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: XOPURE_SYNC_CURSOR_OBJECT_ID,
});
