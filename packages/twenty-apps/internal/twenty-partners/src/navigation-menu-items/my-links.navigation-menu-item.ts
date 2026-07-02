import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  MY_LINKS_NAV_UNIVERSAL_IDENTIFIER,
  MY_LINKS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

import { PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER } from './partner-workspace-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: MY_LINKS_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconLink',
  position: 5,
  folderUniversalIdentifier: PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: MY_LINKS_VIEW_UNIVERSAL_IDENTIFIER,
});
