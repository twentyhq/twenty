import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type GraphCollectionPage } from 'src/features/transcripts/logic-functions/types/graph-collection-page.type';
import { type TeamsCalendarEvent } from 'src/features/transcripts/logic-functions/types/teams-calendar-event.type';
import { type TeamsMeetingOccurrence } from 'src/features/transcripts/logic-functions/types/teams-meeting-occurrence.type';
import { graphFetchJson } from 'src/features/transcripts/logic-functions/utils/graph-fetch-json.util';
import { toTeamsMeetingOccurrence } from 'src/features/transcripts/logic-functions/utils/to-teams-meeting-occurrence.util';

export const listTeamsCalendarPage = async ({
  accessToken,
  url,
}: {
  accessToken: string;
  url: string;
}): Promise<{
  occurrences: TeamsMeetingOccurrence[];
  nextPageUrl?: string;
}> => {
  const page = await graphFetchJson<GraphCollectionPage<TeamsCalendarEvent>>({
    accessToken,
    url,
  });
  const occurrences = (page.value ?? []).flatMap((event) => {
    const occurrence = toTeamsMeetingOccurrence(event);

    return isDefined(occurrence) ? [occurrence] : [];
  });

  return {
    occurrences,
    ...(isNonEmptyString(page['@odata.nextLink'])
      ? { nextPageUrl: page['@odata.nextLink'] }
      : {}),
  };
};
