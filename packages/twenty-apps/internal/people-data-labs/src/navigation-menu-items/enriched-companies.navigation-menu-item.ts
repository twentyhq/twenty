import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  PDL_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIERS,
  PDL_VIEW_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier:
    PDL_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIERS.enrichedCompanies,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconSparkles',
  position: 1,
  folderUniversalIdentifier:
    PDL_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIERS.folder,
  viewUniversalIdentifier: PDL_VIEW_UNIVERSAL_IDENTIFIERS.enrichedCompanies,
});
