import {
  NavigationMenuItemType,
  defineNavigationMenuItem,
} from 'twenty-sdk/define';

import {
  SEARCH_ENGAGEMENT_TERMS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  SEARCH_ENGAGEMENT_TERMS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier:
    SEARCH_ENGAGEMENT_TERMS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Engagement terms',
  icon: 'IconCoins',
  color: 'green',
  position: 20,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: SEARCH_ENGAGEMENT_TERMS_VIEW_UNIVERSAL_IDENTIFIER,
});
