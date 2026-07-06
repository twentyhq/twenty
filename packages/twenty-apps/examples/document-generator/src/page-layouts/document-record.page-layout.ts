import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  DOCUMENT_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  DOCUMENT_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  DOCUMENT_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  DOCUMENT_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  DOCUMENT_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  DOCUMENT_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// A "Fields" tab so the record's own fields always render, plus a "Preview" tab
// that renders the styled document via the document-viewer front component. An
// app-defined record page replaces the object's default layout, so it must
// carry its own fields tab or the record shows "No Data".
export default definePageLayout({
  universalIdentifier: DOCUMENT_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Document record page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: DOCUMENT_FIELDS_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Fields',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier:
            DOCUMENT_FIELDS_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Document fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier: DOCUMENT_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Preview',
      position: 50,
      icon: 'IconEye',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: DOCUMENT_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Document preview',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              DOCUMENT_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
