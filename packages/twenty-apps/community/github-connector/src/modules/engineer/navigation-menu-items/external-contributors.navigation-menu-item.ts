import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { EXTERNAL_CONTRIBUTORS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/views/external-contributors.view';
import { CONTRIBUTORS_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/navigation-menu-items/engineers.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '86ee237b-e109-4e71-80ff-193405f835b7',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: EXTERNAL_CONTRIBUTORS_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: CONTRIBUTORS_FOLDER_UNIVERSAL_IDENTIFIER,
});
