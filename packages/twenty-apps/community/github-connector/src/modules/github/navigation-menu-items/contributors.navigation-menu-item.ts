import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { CONTRIBUTOR_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/objects/contributor.object';
import { GITHUB_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/github/navigation-menu-items/github-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: 'd1c2b3a4-9e8f-4d3c-b2a1-0f9e8d7c6b5a',
  position: 3,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: GITHUB_FOLDER_UNIVERSAL_IDENTIFIER,
});
