import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import {
  MIGRATIONS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  MIGRATIONS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: MIGRATIONS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'salesforce-migrations',
  icon: 'IconCloudDownload',
  color: 'blue',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: MIGRATIONS_VIEW_UNIVERSAL_IDENTIFIER,
});
