import { isNonEmptyString } from '@sniptt/guards';

import { TEAMS_CALENDAR_PAGE_SIZE } from 'src/features/transcripts/constants/teams.constant';
import { type GraphCollectionPage } from 'src/features/transcripts/logic-functions/types/graph-collection-page.type';
import { type TeamsCalendarEvent } from 'src/features/transcripts/logic-functions/types/teams-calendar-event.type';
import { type TeamsMeetingWindow } from 'src/features/transcripts/logic-functions/types/teams-meeting-window.type';
import { graphFetchJson } from 'src/features/transcripts/logic-functions/utils/graph-fetch-json.util';
import { resolveGraphUrlOrThrow } from 'src/features/transcripts/logic-functions/utils/resolve-graph-url-or-throw.util';

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

  const page = await graphFetchJson<GraphCollectionPage<TeamsCalendarEvent>>({
    accessToken,
    url,
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
