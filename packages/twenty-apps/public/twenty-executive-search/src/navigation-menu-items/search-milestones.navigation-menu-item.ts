import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  SEARCH_MILESTONES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  SEARCH_MILESTONES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier:
    SEARCH_MILESTONES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Search Milestones',
  icon: 'IconFlag',
  color: 'orange',
  position: 23,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: SEARCH_MILESTONES_VIEW_UNIVERSAL_IDENTIFIER,
});
