import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { BRIEFS_TO_MATCH_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/briefs-to-match.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'c46f6b03-ee43-4799-9615-270ad28d2848',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconUserOff',
  position: 0,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: BRIEFS_TO_MATCH_VIEW_UNIVERSAL_IDENTIFIER,
});
