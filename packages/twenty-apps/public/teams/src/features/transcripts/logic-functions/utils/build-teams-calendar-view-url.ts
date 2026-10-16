import { TEAMS_CALENDAR_PAGE_SIZE } from 'src/features/transcripts/logic-functions/constants/teams-calendar-page-size';
import { type TeamsMeetingWindow } from 'src/features/transcripts/logic-functions/types/teams-meeting-window.type';

export const buildTeamsCalendarViewUrl = ({
  startDateTime,
  endDateTime,
  pageSize = TEAMS_CALENDAR_PAGE_SIZE,
}: TeamsMeetingWindow & { pageSize?: number }): string => {
  const query = new URLSearchParams({
    startDateTime,
    endDateTime,
    $select:
      'id,iCalUId,seriesMasterId,isOrganizer,isCancelled,isOnlineMeeting,onlineMeetingProvider,onlineMeeting,start,end',
    $top: String(pageSize),
  });

  return `me/calendarView?${query}`;
};
