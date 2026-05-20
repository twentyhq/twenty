import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  ALL_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
  PARTNERS_NAV_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: PARTNERS_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconBuildingStore',
  position: 3,
  viewUniversalIdentifier: ALL_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
});
