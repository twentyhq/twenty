import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  APP_DISPLAY_NAME,
  MAIN_PAGE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  MAIN_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  MAIN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  MAIN_PAGE_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: MAIN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: APP_DISPLAY_NAME,
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: MAIN_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Overview',
      position: 0,
      icon: 'IconApps',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: MAIN_PAGE_WIDGET_UNIVERSAL_IDENTIFIER,
          title: ' ',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, column: 0, rowSpan: 12, columnSpan: 12 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              MAIN_PAGE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
