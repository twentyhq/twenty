import { CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';
import { TimelineCalendarEventParticipant } from '~/generated-metadata/graphql';

export const isTimelineCalendarEventParticipant = (
  participant: CalendarEventParticipant | TimelineCalendarEventParticipant,
): participant is TimelineCalendarEventParticipant => {
  return 'workspaceMemberId' in participant && !('person' in participant);
};
