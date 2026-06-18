import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { MY_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/my-applications.view';

import { PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER } from './partner-workspace-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '71c418f0-5761-4797-830a-2cae6d4bdd49',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconSend',
  position: 1,
  folderUniversalIdentifier: PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: MY_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
});
