import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  SEARCH_ASSIGNMENT_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  SEARCH_ASSIGNMENT_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_ASSIGNMENT_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: SEARCH_ASSIGNMENT_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Search Assignment record page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier:
        SEARCH_ASSIGNMENT_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Fields',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier:
            SEARCH_ASSIGNMENT_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Search Assignment fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
  ],
});
