import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  TEMPLATE_BODY_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  TEMPLATE_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  TEMPLATE_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  TEMPLATE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  TEMPLATE_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  TIMELINE_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  TIMELINE_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: TEMPLATE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Template record page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: TEMPLATE_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Fields',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier:
            TEMPLATE_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      layoutMode: PageLayoutTabLayoutMode.GRID,
      position: 1,
      title: 'Template',
      universalIdentifier: TEMPLATE_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      widgets: [
        {
          universalIdentifier: TEMPLATE_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Template',
          type: 'FIELD',
          gridPosition: { row: 0, column: 0, rowSpan: 12, columnSpan: 12 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: TEMPLATE_BODY_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'EDITOR',
          },
        },
      ],
    },
    {
      universalIdentifier: TIMELINE_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Timeline',
      position: 100,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: TIMELINE_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
  ],
});
