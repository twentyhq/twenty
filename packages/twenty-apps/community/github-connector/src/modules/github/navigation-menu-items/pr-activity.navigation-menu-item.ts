import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { PR_ACTIVITY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/page-layouts/pr-activity.page-layout';
import { GITHUB_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/github/navigation-menu-items/github-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: 'e8f9a1b2-c3d4-4567-89ab-cdef01234567',
  name: 'PR Activity',
  icon: 'IconChartLine',
  position: 4,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: PR_ACTIVITY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: GITHUB_FOLDER_UNIVERSAL_IDENTIFIER,
});
