import {
  RESEND_SYNC_STATUS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  RESEND_SYNC_STATUS_PAGE_HOME_TAB_UNIVERSAL_IDENTIFIER,
  RESEND_SYNC_STATUS_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  RESEND_SYNC_STATUS_PAGE_WIDGET_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: RESEND_SYNC_STATUS_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Resend Sync Status',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier:
        RESEND_SYNC_STATUS_PAGE_HOME_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Sync Status',
      position: 0,
      icon: 'IconRefresh',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier:
            RESEND_SYNC_STATUS_PAGE_WIDGET_UNIVERSAL_IDENTIFIER,
          title: 'Sync Status',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              RESEND_SYNC_STATUS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
          gridPosition: {
            row: 0,
            column: 0,
            rowSpan: 12,
            columnSpan: 12,
          },
        },
      ],
    },
  ],
});
