import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  PARTNER_QUOTES_NAV_UNIVERSAL_IDENTIFIER,
  PARTNER_QUOTES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: PARTNER_QUOTES_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconFileDollar',
  position: 8,
  viewUniversalIdentifier: PARTNER_QUOTES_VIEW_UNIVERSAL_IDENTIFIER,
});
