import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  PARTNER_QUOTES_NAV_UNIVERSAL_IDENTIFIER,
  PARTNER_QUOTES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: PARTNER_QUOTES_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconFileDollar',
  position: 3,
  folderUniversalIdentifier: '857be3b5-82c6-45f7-b546-e20a8a97be8d',
  viewUniversalIdentifier: PARTNER_QUOTES_VIEW_UNIVERSAL_IDENTIFIER,
});
