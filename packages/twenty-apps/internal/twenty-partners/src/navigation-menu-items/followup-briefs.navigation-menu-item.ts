import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { FOLLOWUP_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/followup-briefs.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'd4017fb3-0bfd-4099-94e8-e1ceffa8faca',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconClockExclamation',
  position: 3,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: FOLLOWUP_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER,
});
