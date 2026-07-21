import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import {
  MY_CASE_STUDIES_FRONT_COMPONENT_ID,
  MY_CASE_STUDIES_PAGE_LAYOUT_ID,
  MY_CASE_STUDIES_PAGE_TAB_ID,
  MY_CASE_STUDIES_PAGE_WIDGET_ID,
} from 'src/constants/my-case-studies.constants';

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
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: MY_CASE_STUDIES_PAGE_WIDGET_ID,
          title: 'My Case Studies',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, column: 0, rowSpan: 14, columnSpan: 12 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier: MY_CASE_STUDIES_FRONT_COMPONENT_ID,
          },
        },
      ],
    },
  ],
});
