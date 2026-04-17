import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk';

import {
  QUOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  QUOTE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  QUOTE_SECTIONS_PANEL_UNIVERSAL_IDENTIFIER,
  QUOTE_SECTIONS_TAB_UNIVERSAL_IDENTIFIER,
  QUOTE_SECTIONS_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: QUOTE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Quote Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: QUOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: QUOTE_SECTIONS_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Sections',
      position: 50,
      icon: 'IconLayoutList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: QUOTE_SECTIONS_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Quote Sections',
          type: 'FRONT_COMPONENT',
          position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier: QUOTE_SECTIONS_PANEL_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
