import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { APPLICATIONS_REVIEW_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/applications-review.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'fcf7e5e8-9ec2-4f08-898a-39e51a2787d0',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconUserPlus',
  position: 4,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: APPLICATIONS_REVIEW_VIEW_UNIVERSAL_IDENTIFIER,
});
