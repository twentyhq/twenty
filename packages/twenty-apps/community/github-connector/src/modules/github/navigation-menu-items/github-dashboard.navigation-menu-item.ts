import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { GITHUB_DASHBOARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/page-layouts/github-dashboard.page-layout';
import { GITHUB_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/github/navigation-menu-items/github-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: 'e8f9a1b2-c3d4-4567-89ab-cdef01234567',
  name: 'GitHub Dashboard',
  icon: 'IconBrandGithub',
  position: 6,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier:
    GITHUB_DASHBOARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: GITHUB_FOLDER_UNIVERSAL_IDENTIFIER,
});
