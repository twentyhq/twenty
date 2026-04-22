import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { CONTRIBUTORS_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/navigation-menu-items/contributors.navigation-menu-item';
import { PR_ACTIVITY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/page-layouts/pr-activity.page-layout';

export default defineNavigationMenuItem({
  universalIdentifier: 'e8f9a1b2-c3d4-4567-89ab-cdef01234567',
  name: 'PR Activity',
  icon: 'IconChartLine',
  position: 3,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: PR_ACTIVITY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: CONTRIBUTORS_FOLDER_UNIVERSAL_IDENTIFIER,
});
