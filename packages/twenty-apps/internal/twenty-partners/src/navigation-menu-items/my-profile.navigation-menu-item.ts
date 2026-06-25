import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { MY_PROFILE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/my-profile.view';

import { PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER } from './partner-workspace-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '85c69095-516d-40b8-864d-f0a20f1ad88f',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconUser',
  position: 3,
  folderUniversalIdentifier: PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: MY_PROFILE_VIEW_UNIVERSAL_IDENTIFIER,
});
