import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  TEMPLATES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  TEMPLATES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: TEMPLATES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Templates',
  icon: 'IconFileText',
  color: 'blue',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: TEMPLATES_VIEW_UNIVERSAL_IDENTIFIER,
});
