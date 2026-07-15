import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  SEARCH_CRITERION_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  SEARCH_CRITERION_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  SEARCH_CRITERION_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_CRITERION_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: SEARCH_CRITERION_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Search Criterion record page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: SEARCH_CRITERION_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier:
        SEARCH_CRITERION_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Fields',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier:
            SEARCH_CRITERION_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Search Criterion fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
  ],
});
