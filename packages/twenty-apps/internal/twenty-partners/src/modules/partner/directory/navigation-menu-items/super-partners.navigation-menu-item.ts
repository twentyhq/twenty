import {
  NavigationMenuItemType,
  defineNavigationMenuItem,
} from 'twenty-sdk/define';

import { SUPER_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/partner/directory/views/super-partners.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'f79c4981-c50a-47f7-8577-35eb46434eb7',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconStar',
  position: 5,
  folderUniversalIdentifier: '857be3b5-82c6-45f7-b546-e20a8a97be8d',
  viewUniversalIdentifier: SUPER_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
});
