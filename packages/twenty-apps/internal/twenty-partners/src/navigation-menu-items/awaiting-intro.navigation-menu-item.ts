import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { MATCHING_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/matching-folder.navigation-menu-item';
import { AWAITING_INTRO_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/awaiting-intro.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'c0a8b110-0000-4000-8000-000000000008',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconBellRinging',
  position: 2,
  folderUniversalIdentifier: MATCHING_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: AWAITING_INTRO_VIEW_UNIVERSAL_IDENTIFIER,
});
