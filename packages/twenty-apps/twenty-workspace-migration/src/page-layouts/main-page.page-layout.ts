import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  APP_DISPLAY_NAME,
  MAIN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  MIGRATION_STATUS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  MIGRATION_STATUS_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  MIGRATION_STATUS_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: MAIN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: APP_DISPLAY_NAME,
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: MIGRATION_STATUS_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Migration status',
      position: 0,
      icon: 'IconActivity',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: MIGRATION_STATUS_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Migration status',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, column: 0, rowSpan: 12, columnSpan: 12 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
            MIGRATION_STATUS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
