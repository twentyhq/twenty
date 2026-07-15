import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  SEARCH_CRITERIA_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  SEARCH_CRITERIA_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier:
    SEARCH_CRITERIA_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Search Criteria',
  icon: 'IconListCheck',
  color: 'green',
  position: 25,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: SEARCH_CRITERIA_VIEW_UNIVERSAL_IDENTIFIER,
});
