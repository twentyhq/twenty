import { TEAMS_CALENDAR_PAGE_SIZE } from 'src/features/transcripts/constants/teams.constant';
import { type TeamsMeetingWindow } from 'src/features/transcripts/logic-functions/types/teams-meeting-window.type';
import { resolveGraphUrlOrThrow } from 'src/features/transcripts/logic-functions/utils/resolve-graph-url-or-throw.util';

export const resolveTeamsCalendarPageUrlOrThrow = ({
  window,
  nextPageUrl,
}: {
  window: TeamsMeetingWindow;
  nextPageUrl?: string;
}): string => {
  const query = new URLSearchParams({
    startDateTime: window.startDateTime,
    endDateTime: window.endDateTime,
    $select:
      'isOrganizer,isCancelled,isOnlineMeeting,onlineMeetingProvider,onlineMeeting,start,end',
    $top: String(TEAMS_CALENDAR_PAGE_SIZE),
  });
  const url = resolveGraphUrlOrThrow(nextPageUrl ?? `me/calendarView?${query}`);
  const pathname = new URL(url).pathname;

  if (
    pathname !== '/v1.0/me/calendarView' &&
    pathname !== '/v1.0/me/calendarView/'
  ) {
    throw new Error(
      'Teams calendar pagination URLs must use /v1.0/me/calendarView',
    );
  }

  return url;
};
