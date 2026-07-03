import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  DOCUMENT_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  DOCUMENT_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  DOCUMENT_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  DOCUMENT_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Adds a "Preview" tab to the Document record page that renders the styled
// document via the document-viewer front component.
export default definePageLayout({
  universalIdentifier: DOCUMENT_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Document record page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
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
