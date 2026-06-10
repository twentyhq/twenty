import {
  NavigationMenuItemType,
  defineNavigationMenuItem,
} from 'twenty-sdk/define';

import { PDL_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: PDL_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIERS.folder,
  type: NavigationMenuItemType.FOLDER,
  name: 'People Data Labs',
  icon: 'IconSparkles',
  position: 0,
});
