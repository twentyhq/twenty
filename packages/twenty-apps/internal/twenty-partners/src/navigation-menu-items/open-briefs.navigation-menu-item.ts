import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { OPEN_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/open-briefs.view';

// Pipeline folder (0b2e499a…), position 5 — after Applications (position 4).
export default defineNavigationMenuItem({
  universalIdentifier: '1392ad4d-3792-4187-a1c5-ee05815dcfde',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconBuildingStore',
  position: 5,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: OPEN_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER,
});
