import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { ISSUE_UNIVERSAL_IDENTIFIER } from 'src/modules/github/issue/objects/issue.object';
import { GITHUB_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/github/navigation-menu-items/github-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '7c4f8e1a-3b9d-4f2e-8a6c-1d5b7e9f3a2c',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: ISSUE_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: GITHUB_FOLDER_UNIVERSAL_IDENTIFIER,
});
