import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  PARTNER_APPLICATIONS_NAV_UNIVERSAL_IDENTIFIER,
  PARTNER_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: PARTNER_APPLICATIONS_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconUserPlus',
  position: 6,
  viewUniversalIdentifier: PARTNER_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
});
