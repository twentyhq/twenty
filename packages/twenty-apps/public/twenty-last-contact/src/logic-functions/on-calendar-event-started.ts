import { defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CALENDAR_EVENT_STARTED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { updatePersonLastContactAtFromCalendar } from 'src/utils/update-person-last-contact-at-from-calendar';

const CRON_INTERVAL_MINUTES = Math.min(
  Math.max(Number(process.env.CALENDAR_CRON_INTERVAL_MINUTES ?? 5), 1),
  60 * 24,
);

const SECURITY_OVERLAP_MINUTES = 5;

const QUERY_MAX_RECORDS = 200;

const handler = async (): Promise<void> => {
  const client = new CoreApiClient();

  const now = new Date();
  const windowStart = new Date(
    now.getTime() -
      (CRON_INTERVAL_MINUTES + SECURITY_OVERLAP_MINUTES) * 60 * 1000,
  );

  const calendarEventIds: string[] = [];
  let calendarEventsCursor: string | undefined;
  let calendarEventsHasNextPage = true;

  while (calendarEventsHasNextPage) {
    const { calendarEvents } = await client.query({
      calendarEvents: {
        __args: {
          filter: {
            and: [
              { startsAt: { gt: windowStart.toISOString() } },
              { startsAt: { lte: now.toISOString() } },
              { isCanceled: { eq: false } },
            ],
          },
          first: QUERY_MAX_RECORDS,
          after: calendarEventsCursor,
        },
        edges: {
          node: {
            id: true,
          },
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
      },
    });

    calendarEventIds.push(
      ...(calendarEvents?.edges.map((edge: { node: { id: string } }) => edge.node.id) ?? []),
    );
    calendarEventsHasNextPage = calendarEvents?.pageInfo.hasNextPage ?? false;
    calendarEventsCursor = calendarEvents?.pageInfo.endCursor ?? undefined;
  }

  if (calendarEventIds.length === 0) {
    return;
  }

  const personIds = new Set<string>();
  let participantsCursor: string | undefined;
  let participantsHasNextPage = true;

  while (participantsHasNextPage) {
    const { calendarEventParticipants } = await client.query({
      calendarEventParticipants: {
        __args: {
          filter: { calendarEventId: { in: calendarEventIds } },
          first: QUERY_MAX_RECORDS,
          after: participantsCursor,
        },
        edges: {
          node: {
            id: true,
            personId: true,
          },
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
      },
    });

    for (const edge of calendarEventParticipants?.edges ?? []) {
      const personId = edge.node.personId;

      if (personId !== null && personId !== undefined) {
        personIds.add(personId);
      }
    }
    participantsHasNextPage =
      calendarEventParticipants?.pageInfo.hasNextPage ?? false;
    participantsCursor =
      calendarEventParticipants?.pageInfo.endCursor ?? undefined;
  }

  await Promise.all(
    [...personIds].map((personId) =>
      updatePersonLastContactAtFromCalendar(client, personId),
    ),
  );
};

export default defineLogicFunction({
  universalIdentifier:
    CALENDAR_EVENT_STARTED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-calendar-event-started',
  description:
    'Updates last-contacted fields for participants of calendar events whose start time just passed.',
  timeoutSeconds: 60,
  cronTriggerSettings: {
    pattern: `*/${CRON_INTERVAL_MINUTES} * * * *`,
  },
  handler,
});
