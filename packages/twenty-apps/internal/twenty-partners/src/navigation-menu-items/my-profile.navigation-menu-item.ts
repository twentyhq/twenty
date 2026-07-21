import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  MY_PROFILE_NAV_ITEM_ID,
  MY_PROFILE_PAGE_LAYOUT_ID,
} from 'src/constants/my-profile.constants';

import { PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER } from './partner-workspace-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: MY_PROFILE_NAV_ITEM_ID,
  name: 'My Profile',
  type: NavigationMenuItemType.PAGE_LAYOUT,
  icon: 'IconUser',
  position: 3,
  folderUniversalIdentifier: PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER,
  pageLayoutUniversalIdentifier: MY_PROFILE_PAGE_LAYOUT_ID,
});
