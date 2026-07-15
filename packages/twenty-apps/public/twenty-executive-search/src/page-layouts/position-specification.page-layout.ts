import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  POSITION_SPECIFICATION_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  POSITION_SPECIFICATION_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  POSITION_SPECIFICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  POSITION_SPECIFICATION_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier:
    POSITION_SPECIFICATION_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Position Specification record page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier:
    POSITION_SPECIFICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier:
        POSITION_SPECIFICATION_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Fields',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier:
            POSITION_SPECIFICATION_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Position Specification fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
  ],
});
