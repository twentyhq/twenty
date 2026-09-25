import { isNonEmptyString } from '@sniptt/guards';

import { type GraphCollectionPage } from 'src/features/transcripts/logic-functions/types/graph-collection-page.type';
import { type TeamsCalendarEvent } from 'src/features/transcripts/logic-functions/types/teams-calendar-event.type';
import { graphFetchJson } from 'src/features/transcripts/logic-functions/utils/graph-fetch-json.util';

export const listTeamsCalendarPage = async ({
  accessToken,
  url,
}: {
  accessToken: string;
  url: string;
}): Promise<{ joinWebUrls: string[]; nextPageUrl?: string }> => {
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
