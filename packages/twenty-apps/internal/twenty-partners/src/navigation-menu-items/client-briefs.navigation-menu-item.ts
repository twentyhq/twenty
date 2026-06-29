import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { CLIENT_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/client-briefs.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'e5f9a2b3-4c6d-4e7f-8a1b-2c3d4e5f6a7b',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconFileUpload',
  position: 1,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: CLIENT_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER,
});
