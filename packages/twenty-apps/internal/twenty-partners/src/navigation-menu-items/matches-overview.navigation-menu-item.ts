import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  MATCHES_OVERVIEW_NAV_UNIVERSAL_IDENTIFIER,
  MATCHES_OVERVIEW_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: MATCHES_OVERVIEW_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconLayoutKanban',
  position: 2,
  viewUniversalIdentifier: MATCHES_OVERVIEW_VIEW_UNIVERSAL_IDENTIFIER,
});
