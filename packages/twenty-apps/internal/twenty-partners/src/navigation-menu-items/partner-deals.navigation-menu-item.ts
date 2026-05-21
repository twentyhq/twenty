import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  ALL_MATCHED_DEALS_VIEW_UNIVERSAL_IDENTIFIER,
  PARTNER_DEALS_NAV_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: PARTNER_DEALS_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconHandshake',
  position: 2,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: ALL_MATCHED_DEALS_VIEW_UNIVERSAL_IDENTIFIER,
});
