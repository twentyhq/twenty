import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { type FirefliesTranscript } from 'src/logic-functions/types/fireflies-transcript.type';

type CalendarChannelEventAssociationsConnection = {
  edges: Array<{ node: { calendarEventId: string } }>;
};

type CalendarEventsConnection = {
  edges: Array<{ node: { id: string } }>;
};

const findByEventExternalId = async (
  client: CoreApiClient,
  externalIds: string[],
): Promise<string | null> => {
  if (externalIds.length === 0) {
    return null;
  }

  const { calendarChannelEventAssociations } = await client.query({
    calendarChannelEventAssociations: {
      __args: {
        filter: {
          eventExternalId: { in: externalIds },
        },
        first: 1,
      },
      edges: {
        node: {
          calendarEventId: true,
        },
      },
    },
  });

  const node = (
    calendarChannelEventAssociations as
      | CalendarChannelEventAssociationsConnection
      | undefined
  )?.edges?.[0]?.node;

  return node?.calendarEventId ?? null;
};

const findByICalUid = async (
  client: CoreApiClient,
  iCalUid: string,
): Promise<string | null> => {
  const { calendarEvents } = await client.query({
    calendarEvents: {
      __args: {
        filter: {
          iCalUid: { eq: iCalUid },
        },
        first: 1,
      },
      edges: {
        node: {
          id: true,
        },
      },
    },
  });

  const node = (calendarEvents as CalendarEventsConnection | undefined)
    ?.edges?.[0]?.node;

  return node?.id ?? null;
};

export const findMatchingCalendarEvent = async ({
  client,
  transcript,
}: {
  client: CoreApiClient;
  transcript: FirefliesTranscript;
}): Promise<
  | {
      matched: true;
      calendarEventId: string;
      matchedBy: 'externalId' | 'iCalUid';
    }
  | { matched: false; reason: string }
> => {
  const externalIdCandidates = [
    transcript.calendar_id,
    transcript.cal_id,
  ].filter(isNonEmptyString);

  if (externalIdCandidates.length > 0) {
    const calendarEventId = await findByEventExternalId(
      client,
      externalIdCandidates,
    );

    if (isDefined(calendarEventId)) {
      return { matched: true, calendarEventId, matchedBy: 'externalId' };
    }
  }

  if (isNonEmptyString(transcript.calendar_id)) {
    const calendarEventId = await findByICalUid(client, transcript.calendar_id);

    if (isDefined(calendarEventId)) {
      return { matched: true, calendarEventId, matchedBy: 'iCalUid' };
    }
  }

  return {
    matched: false,
    reason:
      'No CalendarEvent matched the transcript by external ID or iCalUid. Either the meeting was never on a synced calendar, or its calendar sync (Google/Outlook/CalDAV) is not configured in Twenty. Orphan calls are skipped in v1.',
  };
};
