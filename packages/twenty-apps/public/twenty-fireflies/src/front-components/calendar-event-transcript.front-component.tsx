import { defineFrontComponent } from 'twenty-sdk/define';

import { CALENDAR_EVENT_TRANSCRIPT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CalendarEventTranscript } from 'src/front-components/components/CalendarEventTranscript';

export default defineFrontComponent({
  universalIdentifier:
    CALENDAR_EVENT_TRANSCRIPT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'calendar-event-transcript',
  description:
    'Read-only diarized Fireflies transcript viewer for the calendar event record page.',
  component: CalendarEventTranscript,
});
