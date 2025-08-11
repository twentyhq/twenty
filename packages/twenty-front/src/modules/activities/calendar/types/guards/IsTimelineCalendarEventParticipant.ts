import { type CalendarEventParticipant } from '@/activities/calendar/types/CalendarEventParticipant';
import { type TimelineCalendarEventParticipant } from '~/generated-metadata/graphql';

export const isTimelineCalendarEventParticipant = (
  participant: CalendarEventParticipant | TimelineCalendarEventParticipant,
): participant is TimelineCalendarEventParticipant => {
  return 'avatarUrl' in participant;
};
