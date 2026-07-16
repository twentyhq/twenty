import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  SEARCH_ASSIGNMENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  SEARCH_ASSIGNMENTS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier:
    SEARCH_ASSIGNMENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Search Assignments',
  icon: 'IconBriefcase',
  color: 'blue',
  position: 21,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: SEARCH_ASSIGNMENTS_VIEW_UNIVERSAL_IDENTIFIER,
});
