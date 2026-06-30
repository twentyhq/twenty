import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { APPLICATIONS_BY_OPPORTUNITY_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/applications-by-opportunity.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'e80057bf-9b46-4502-8ccd-b25870ec293c',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconTargetArrow',
  position: 6,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: APPLICATIONS_BY_OPPORTUNITY_VIEW_UNIVERSAL_IDENTIFIER,
});
