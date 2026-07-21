import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { MY_CASE_STUDIES_NAV_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

import { MY_CASE_STUDIES_PAGE_LAYOUT_ID } from 'src/constants/my-case-studies.constants';
import { PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER } from './partner-workspace-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: MY_CASE_STUDIES_NAV_UNIVERSAL_IDENTIFIER,
  name: 'My Case Studies',
  type: NavigationMenuItemType.PAGE_LAYOUT,
  icon: 'IconBriefcase',
  position: 4,
  folderUniversalIdentifier: PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER,
  pageLayoutUniversalIdentifier: MY_CASE_STUDIES_PAGE_LAYOUT_ID,
});
