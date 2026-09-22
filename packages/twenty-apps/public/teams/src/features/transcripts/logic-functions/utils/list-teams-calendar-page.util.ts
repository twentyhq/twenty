import { isNonEmptyString } from '@sniptt/guards';

import { TEAMS_CALENDAR_PAGE_SIZE } from 'src/features/transcripts/constants/teams.constant';
import { type GraphCollectionPage } from 'src/features/transcripts/logic-functions/types/graph-collection-page.type';
import { type TeamsCalendarEvent } from 'src/features/transcripts/logic-functions/types/teams-calendar-event.type';
import { type TeamsMeetingWindow } from 'src/features/transcripts/logic-functions/types/teams-meeting-window.type';
import { graphFetchJson } from 'src/features/transcripts/logic-functions/utils/graph-fetch-json.util';

export const listTeamsCalendarPage = async ({
  accessToken,
  window,
  nextPageUrl,
}: {
  accessToken: string;
  window: TeamsMeetingWindow;
  nextPageUrl?: string;
}): Promise<{ joinWebUrls: string[]; nextPageUrl?: string }> => {
  const query = new URLSearchParams({
    startDateTime: window.startDateTime,
    endDateTime: window.endDateTime,
    $select:
      'isOrganizer,isCancelled,isOnlineMeeting,onlineMeetingProvider,onlineMeeting',
    $top: String(TEAMS_CALENDAR_PAGE_SIZE),
  });
  const page = await graphFetchJson<GraphCollectionPage<TeamsCalendarEvent>>({
    accessToken,
    url: nextPageUrl ?? `me/calendarView?${query}`,
  });
  const joinWebUrls = (page.value ?? []).flatMap((event) =>
    event.isOrganizer &&
    !event.isCancelled &&
    event.onlineMeetingProvider === 'teamsForBusiness' &&
    isNonEmptyString(event.onlineMeeting?.joinUrl)
      ? [event.onlineMeeting.joinUrl]
      : [],
  );

  return {
    joinWebUrls: [...new Set(joinWebUrls)],
    ...(isNonEmptyString(page['@odata.nextLink'])
      ? { nextPageUrl: page['@odata.nextLink'] }
      : {}),
  };
};
