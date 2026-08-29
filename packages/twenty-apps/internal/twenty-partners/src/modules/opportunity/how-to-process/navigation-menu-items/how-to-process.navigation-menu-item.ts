import {
  NavigationMenuItemType,
  defineNavigationMenuItem,
} from 'twenty-sdk/define';

import {
  HOW_TO_PROCESS_NAV_ITEM_ID,
  HOW_TO_PROCESS_PAGE_LAYOUT_ID,
} from 'src/modules/opportunity/how-to-process/constants/how-to-process.constants';

export default defineNavigationMenuItem({
  universalIdentifier: HOW_TO_PROCESS_NAV_ITEM_ID,
  name: 'How to process',
  type: NavigationMenuItemType.PAGE_LAYOUT,
  icon: 'IconListCheck',
  position: 10,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  pageLayoutUniversalIdentifier: HOW_TO_PROCESS_PAGE_LAYOUT_ID,
});
