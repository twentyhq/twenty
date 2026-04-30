import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { GITHUB_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/github/navigation-menu-items/github-folder.navigation-menu-item';
import { PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review/objects/pull-request-review.object';

export default defineNavigationMenuItem({
  universalIdentifier: '1f2e3d4c-5b6a-4798-8abc-def012345678',
  position: 4,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: GITHUB_FOLDER_UNIVERSAL_IDENTIFIER,
});
