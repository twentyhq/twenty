import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  VALIDATED_PARTNERS_NAV_UNIVERSAL_IDENTIFIER,
  VALIDATED_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: VALIDATED_PARTNERS_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconCircleCheck',
  position: 0,
  folderUniversalIdentifier: '857be3b5-82c6-45f7-b546-e20a8a97be8d',
  viewUniversalIdentifier: VALIDATED_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
});
