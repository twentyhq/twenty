import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  APP_DISPLAY_NAME,
  MAIN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  MAIN_PAGE_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: MAIN_PAGE_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: APP_DISPLAY_NAME,
  icon: 'IconFile',
  position: -1,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: MAIN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
});
