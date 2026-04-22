import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { CONTRIBUTORS_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/navigation-menu-items/engineers.navigation-menu-item';
import { EXTERNAL_CONTRIBUTIONS_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/page-layouts/external-contributions.page-layout';

export default defineNavigationMenuItem({
  universalIdentifier: 'b9e1c4d2-7a35-4f08-9c62-1d3e5b8a4f70',
  name: 'External Contributions',
  icon: 'IconWorld',
  position: 2,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier:
    EXTERNAL_CONTRIBUTIONS_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: CONTRIBUTORS_FOLDER_UNIVERSAL_IDENTIFIER,
});
