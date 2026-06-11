import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { MATCHING_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/matching-folder.navigation-menu-item';
import { ALL_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/all-applications.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'c0a8b110-0000-4000-8000-000000000006',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconSend',
  position: 1,
  folderUniversalIdentifier: MATCHING_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: ALL_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
});
