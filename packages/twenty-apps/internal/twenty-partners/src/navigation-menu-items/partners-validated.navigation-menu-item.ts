import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { PARTNERS_VALIDATED_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/partners-validated.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'c9cbe1b6-7c07-4327-bd7a-018d0ed0db33',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconCircleCheck',
  position: 3,
  folderUniversalIdentifier: '857be3b5-82c6-45f7-b546-e20a8a97be8d',
  viewUniversalIdentifier: PARTNERS_VALIDATED_VIEW_UNIVERSAL_IDENTIFIER,
});
