import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type GraphCollectionPage } from 'src/features/transcripts/logic-functions/types/graph-collection-page.type';
import { type TeamsCalendarEvent } from 'src/features/transcripts/logic-functions/types/teams-calendar-event.type';
import { type TeamsMeetingOccurrence } from 'src/features/transcripts/logic-functions/types/teams-meeting-occurrence.type';
import { fetchGraphJson } from 'src/features/transcripts/logic-functions/utils/fetch-graph-json';
import { toTeamsMeetingOccurrence } from 'src/features/transcripts/logic-functions/utils/to-teams-meeting-occurrence';

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
  const page = await fetchGraphJson<GraphCollectionPage<TeamsCalendarEvent>>({
    accessToken,
    url,
  });
  const occurrences = (page.value ?? []).flatMap((event) => {
    const occurrence = toTeamsMeetingOccurrence(event);

    return isDefined(occurrence) ? [occurrence] : [];
  });

  return {
    occurrences,
    nextPageUrl: isNonEmptyString(page['@odata.nextLink'])
      ? page['@odata.nextLink']
      : undefined,
  };
};
