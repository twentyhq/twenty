import {
  NavigationMenuItemType,
  defineNavigationMenuItem,
} from 'twenty-sdk/define';

import { PARTNER_APPLICATIONS_NAV_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/partner/application-intake/views/partner-applications.view';

export default defineNavigationMenuItem({
  universalIdentifier: PARTNER_APPLICATIONS_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconInbox',
  position: 9,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: PARTNER_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
});
