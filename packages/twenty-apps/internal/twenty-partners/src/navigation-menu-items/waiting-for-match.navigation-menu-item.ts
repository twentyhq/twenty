import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  WAITING_FOR_MATCH_NAV_UNIVERSAL_IDENTIFIER,
  WAITING_FOR_MATCH_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: WAITING_FOR_MATCH_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconClockHour4',
  position: 0,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: WAITING_FOR_MATCH_VIEW_UNIVERSAL_IDENTIFIER,
});
