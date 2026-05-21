import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  ALL_OPPORTUNITIES_NAV_UNIVERSAL_IDENTIFIER,
  ALL_OPPORTUNITIES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: ALL_OPPORTUNITIES_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconTargetArrow',
  position: 3,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: ALL_OPPORTUNITIES_VIEW_UNIVERSAL_IDENTIFIER,
});
