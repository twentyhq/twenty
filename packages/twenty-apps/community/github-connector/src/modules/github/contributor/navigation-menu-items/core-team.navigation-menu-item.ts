import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { CORE_TEAM_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/views/core-team.view';
import { CONTRIBUTORS_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/navigation-menu-items/contributors.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '88941d3c-1da9-477f-8cd5-f9aa2a6821de',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: CORE_TEAM_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: CONTRIBUTORS_FOLDER_UNIVERSAL_IDENTIFIER,
});
