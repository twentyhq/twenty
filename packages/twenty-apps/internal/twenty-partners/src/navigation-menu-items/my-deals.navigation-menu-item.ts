import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { MY_DEALS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/my-deals.view';

import { PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER } from './partner-workspace-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '783d4920-6bf6-4dbf-b705-228ffcc9a7d7',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconHandshake',
  position: 2,
  folderUniversalIdentifier: PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: MY_DEALS_VIEW_UNIVERSAL_IDENTIFIER,
});
