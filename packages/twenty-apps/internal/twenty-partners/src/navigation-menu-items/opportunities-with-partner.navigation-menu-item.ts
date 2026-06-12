import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  OPPORTUNITIES_WITH_PARTNER_NAV_UNIVERSAL_IDENTIFIER,
  OPPORTUNITIES_WITH_PARTNER_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: OPPORTUNITIES_WITH_PARTNER_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconUserCheck',
  position: 1,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: OPPORTUNITIES_WITH_PARTNER_VIEW_UNIVERSAL_IDENTIFIER,
});
