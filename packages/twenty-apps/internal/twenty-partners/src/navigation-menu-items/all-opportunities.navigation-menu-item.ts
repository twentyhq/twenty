import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  ALL_OPPORTUNITIES_NAV_UNIVERSAL_IDENTIFIER,
  ALL_OPPORTUNITIES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: ALL_OPPORTUNITIES_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconTargetArrow',
  position: 4,
  viewUniversalIdentifier: ALL_OPPORTUNITIES_VIEW_UNIVERSAL_IDENTIFIER,
});
