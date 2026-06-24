import { defineFrontComponent } from 'twenty-sdk/define';
import 'twenty-ui/style.css';

import { CALENDAR_EVENT_RECORDING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/calendar-event-recording-front-component-universal-identifier';
import { CalendarEventRecording } from 'src/front-components/components/CalendarEventRecording';

export default defineFrontComponent({
  universalIdentifier:
    CALENDAR_EVENT_RECORDING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'calendar-event-recording',
  description:
    'Read-only recording viewer with synced transcript for the calendar event record page.',
  component: CalendarEventRecording,
});
