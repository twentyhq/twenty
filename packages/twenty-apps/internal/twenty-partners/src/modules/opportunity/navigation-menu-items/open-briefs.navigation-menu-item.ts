import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { OPEN_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/opportunity/views/open-briefs.view';

import { PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/partner-workspace-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '1392ad4d-3792-4187-a1c5-ee05815dcfde',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconBuildingStore',
  position: 0,
  folderUniversalIdentifier: PARTNER_WORKSPACE_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: OPEN_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER,
});
