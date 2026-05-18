import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  MAIN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  MAIN_PAGE_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: MAIN_PAGE_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'main-page',
  icon: 'IconApps',
  position: 0,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: MAIN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
});
