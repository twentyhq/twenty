import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  TEMPLATE_EDITOR_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  TEMPLATE_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  TEMPLATE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  TEMPLATE_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Adds an "Editor" tab to the Template record page for editing the Markdown
// body with a live preview.
export default definePageLayout({
  universalIdentifier: TEMPLATE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Template record page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: TEMPLATE_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Editor',
      position: 50,
      icon: 'IconEdit',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: TEMPLATE_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Template editor',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              TEMPLATE_EDITOR_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
