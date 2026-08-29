import {
  NavigationMenuItemType,
  defineNavigationMenuItem,
} from 'twenty-sdk/define';

import {
  HOW_TO_REVIEW_NAV_ITEM_ID,
  HOW_TO_REVIEW_PAGE_LAYOUT_ID,
} from 'src/modules/partner/application-intake/constants/how-to-review.constants';

export default defineNavigationMenuItem({
  universalIdentifier: HOW_TO_REVIEW_NAV_ITEM_ID,
  name: 'How to review',
  type: NavigationMenuItemType.PAGE_LAYOUT,
  icon: 'IconListCheck',
  position: 11,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  pageLayoutUniversalIdentifier: HOW_TO_REVIEW_PAGE_LAYOUT_ID,
});
