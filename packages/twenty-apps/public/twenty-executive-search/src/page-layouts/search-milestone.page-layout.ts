import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  SEARCH_MILESTONE_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  SEARCH_MILESTONE_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  SEARCH_MILESTONE_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_MILESTONE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: SEARCH_MILESTONE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Search Milestone record page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: SEARCH_MILESTONE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier:
        SEARCH_MILESTONE_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Fields',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier:
            SEARCH_MILESTONE_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Search Milestone fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
  ],
});
