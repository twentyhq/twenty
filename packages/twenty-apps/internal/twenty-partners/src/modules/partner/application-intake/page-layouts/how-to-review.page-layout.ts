import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import {
  HOW_TO_REVIEW_FRONT_COMPONENT_ID,
  HOW_TO_REVIEW_PAGE_LAYOUT_ID,
  HOW_TO_REVIEW_PAGE_TAB_ID,
  HOW_TO_REVIEW_PAGE_WIDGET_ID,
} from 'src/modules/partner/application-intake/constants/how-to-review.constants';

export default definePageLayout({
  universalIdentifier: HOW_TO_REVIEW_PAGE_LAYOUT_ID,
  name: 'How to review',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: HOW_TO_REVIEW_PAGE_TAB_ID,
      title: 'How to review',
      position: 0,
      icon: 'IconListCheck',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: HOW_TO_REVIEW_PAGE_WIDGET_ID,
          title: 'How to review',
          type: 'FRONT_COMPONENT',
          heightBehavior: 'TAB_VIEWPORT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier: HOW_TO_REVIEW_FRONT_COMPONENT_ID,
          },
        },
      ],
    },
  ],
});
