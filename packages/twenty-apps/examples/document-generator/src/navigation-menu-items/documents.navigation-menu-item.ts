import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  DOCUMENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  DOCUMENTS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: DOCUMENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Documents',
  icon: 'IconFile',
  color: 'green',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: DOCUMENTS_VIEW_UNIVERSAL_IDENTIFIER,
});
