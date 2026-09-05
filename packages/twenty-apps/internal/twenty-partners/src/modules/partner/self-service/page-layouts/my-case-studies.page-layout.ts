import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  MY_CASE_STUDIES_FRONT_COMPONENT_ID,
  MY_CASE_STUDIES_PAGE_LAYOUT_ID,
  MY_CASE_STUDIES_PAGE_TAB_ID,
  MY_CASE_STUDIES_PAGE_WIDGET_ID,
} from 'src/modules/partner/self-service/constants/my-case-studies.constants';

export default definePageLayout({
  universalIdentifier: MY_CASE_STUDIES_PAGE_LAYOUT_ID,
  name: 'My Case Studies',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: MY_CASE_STUDIES_PAGE_TAB_ID,
      title: 'My Case Studies',
      position: 0,
      icon: 'IconBriefcase',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: MY_CASE_STUDIES_PAGE_WIDGET_ID,
          title: 'My Case Studies',
          type: 'FRONT_COMPONENT',
          heightBehavior: 'TAB_VIEWPORT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              MY_CASE_STUDIES_FRONT_COMPONENT_ID,
          },
        },
      ],
    },
  ],
});
