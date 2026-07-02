import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  MY_SERVICES_NAV_UNIVERSAL_IDENTIFIER,
  MY_SERVICES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

import { PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER } from './partner-workspace-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: MY_SERVICES_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconTool',
  position: 4,
  folderUniversalIdentifier: PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: MY_SERVICES_VIEW_UNIVERSAL_IDENTIFIER,
});
