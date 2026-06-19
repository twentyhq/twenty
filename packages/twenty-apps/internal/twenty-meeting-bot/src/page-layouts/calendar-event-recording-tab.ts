import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';

import { CALENDAR_EVENT_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER } from 'src/constants/calendar-event-record-page-layout-universal-identifier';
import { CALENDAR_EVENT_RECORDING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/calendar-event-recording-front-component-universal-identifier';
import { CALENDAR_EVENT_RECORDING_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER } from 'src/constants/calendar-event-recording-page-layout-tab-universal-identifier';
import { CALENDAR_EVENT_RECORDING_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER } from 'src/constants/calendar-event-recording-page-layout-widget-universal-identifier';

// Position 15 slots the tab between the standard Home (10) and Timeline (20) tabs.
export default definePageLayoutTab({
  universalIdentifier:
    CALENDAR_EVENT_RECORDING_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  title: 'Recording',
  position: 15,
  icon: 'IconVideo',
  layoutMode: PageLayoutTabLayoutMode.CANVAS,
  pageLayoutUniversalIdentifier:
    CALENDAR_EVENT_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  widgets: [
    {
      universalIdentifier:
        CALENDAR_EVENT_RECORDING_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
      title: 'Recording',
      type: 'FRONT_COMPONENT',
      gridPosition: { row: 0, column: 0, rowSpan: 12, columnSpan: 12 },
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          CALENDAR_EVENT_RECORDING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});
