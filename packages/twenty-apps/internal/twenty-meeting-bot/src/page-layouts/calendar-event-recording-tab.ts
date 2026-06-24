import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';

import { CALENDAR_EVENT_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER } from 'src/constants/calendar-event-record-page-layout-universal-identifier';
import { CALENDAR_EVENT_RECORDING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/calendar-event-recording-front-component-universal-identifier';
import { CALENDAR_EVENT_RECORDING_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER } from 'src/constants/calendar-event-recording-page-layout-tab-universal-identifier';
import { CALENDAR_EVENT_RECORDING_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER } from 'src/constants/calendar-event-recording-page-layout-widget-universal-identifier';

export default definePageLayoutTab({
  universalIdentifier:
    CALENDAR_EVENT_RECORDING_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  title: 'Call Recording',
  position: 25,
  icon: 'IconVideo',
  layoutMode: PageLayoutTabLayoutMode.CANVAS,
  pageLayoutUniversalIdentifier:
    CALENDAR_EVENT_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  widgets: [
    {
      universalIdentifier:
        CALENDAR_EVENT_RECORDING_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
      title: 'Transcript',
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          CALENDAR_EVENT_RECORDING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});
