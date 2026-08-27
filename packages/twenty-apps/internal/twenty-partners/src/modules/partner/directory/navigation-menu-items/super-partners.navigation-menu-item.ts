import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { SUPER_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/partner/directory/views/super-partners.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'f79c4981-c50a-47f7-8577-35eb46434eb7',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconStar',
  position: 7,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: SUPER_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
});
