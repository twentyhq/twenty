import { defineFrontComponent } from 'twenty-sdk/define';

import { CALENDAR_EVENT_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CalendarEventSummary } from 'src/front-components/components/CalendarEventSummary';

export default defineFrontComponent({
  universalIdentifier:
    CALENDAR_EVENT_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'calendar-event-summary',
  description:
    'Read-only Fireflies AI summary viewer for the calendar event record page.',
  component: CalendarEventSummary,
});
