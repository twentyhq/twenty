import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import {
  SEARCH_ENGAGEMENT_TERMS_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  SEARCH_ENGAGEMENT_TERMS_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  SEARCH_ENGAGEMENT_TERMS_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_ENGAGEMENT_TERMS_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier:
    SEARCH_ENGAGEMENT_TERMS_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Engagement terms record page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: SEARCH_ENGAGEMENT_TERMS_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier:
        SEARCH_ENGAGEMENT_TERMS_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Fields',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier:
            SEARCH_ENGAGEMENT_TERMS_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Engagement terms fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
  ],
});
