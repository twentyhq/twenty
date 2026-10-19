import { isNonEmptyString } from '@sniptt/guards';

import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { type TeamsCalendarEvent } from 'src/features/transcripts/logic-functions/types/teams-calendar-event.type';
import { fetchGraphJson } from 'src/features/transcripts/logic-functions/utils/fetch-graph-json';
import { toErrorMessage } from 'src/utils/to-error-message';

export const getTeamsCalendarEventICalUIdOrThrow = async ({
  accessToken,
  eventId,
}: {
  accessToken: string;
  eventId: string;
}): Promise<string | undefined> => {
  try {
    const event = await fetchGraphJson<Pick<TeamsCalendarEvent, 'iCalUId'>>({
      accessToken,
      url: `me/events/${encodeURIComponent(eventId)}?$select=iCalUId`,
    });

    return isNonEmptyString(event.iCalUId) ? event.iCalUId : undefined;
  } catch (error) {
    if (!(error instanceof GraphRequestError)) {
      throw error;
    }

    console.error(
      `[teams] could not read the iCalUId of calendar event ${eventId}: ${toErrorMessage(error)}`,
    );

    return undefined;
  }
};
