import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { ALL_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/all-applications.view';

// Pipeline folder (0b2e499a…), after the opportunity views.
export default defineNavigationMenuItem({
  universalIdentifier: '9170331a-e8b5-4b27-84fe-8929e5d458d1',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconSend',
  position: 4,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: ALL_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
});
