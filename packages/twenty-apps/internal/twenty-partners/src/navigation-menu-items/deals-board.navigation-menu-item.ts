import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { DEALS_BOARD_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/deals-board.view';

export default defineNavigationMenuItem({
  universalIdentifier: '9e4dde3a-46f1-431c-b682-2e1fa8a5622c',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconLayoutKanban',
  position: 1,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: DEALS_BOARD_VIEW_UNIVERSAL_IDENTIFIER,
});
