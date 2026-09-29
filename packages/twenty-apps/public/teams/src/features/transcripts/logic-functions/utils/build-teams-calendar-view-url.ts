import { TEAMS_CALENDAR_PAGE_SIZE } from 'src/features/transcripts/logic-functions/constants/teams-calendar-page-size';
import { type TeamsMeetingWindow } from 'src/features/transcripts/logic-functions/types/teams-meeting-window.type';

export const buildTeamsCalendarViewUrl = (
  window: TeamsMeetingWindow,
): string => {
  const query = new URLSearchParams({
    startDateTime: window.startDateTime,
    endDateTime: window.endDateTime,
    $select:
      'isOrganizer,isCancelled,onlineMeetingProvider,onlineMeeting,start,end',
    $top: String(TEAMS_CALENDAR_PAGE_SIZE),
  });

  return `me/calendarView?${query}`;
};
