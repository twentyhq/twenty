import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { FOLLOWUP_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/followup-applications.view';

export default defineNavigationMenuItem({
  universalIdentifier: '636cddf9-b104-432d-a5d3-3bad36b7a54a',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconClock',
  position: 7,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: FOLLOWUP_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
});
