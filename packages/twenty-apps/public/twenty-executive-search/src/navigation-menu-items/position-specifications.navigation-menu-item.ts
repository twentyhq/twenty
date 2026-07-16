import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  POSITION_SPECIFICATIONS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  POSITION_SPECIFICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier:
    POSITION_SPECIFICATIONS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Position Specifications',
  icon: 'IconFileText',
  color: 'blue',
  position: 24,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: POSITION_SPECIFICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
});
