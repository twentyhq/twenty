import { defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { CALENDAR_CRON_INTERVAL_MINUTES } from 'src/constants/calendar-cron-interval-minutes';
import { CALENDAR_CRON_SECURITY_OVERLAP_MINUTES } from 'src/constants/calendar-cron-security-overlap-minutes';
import { CALENDAR_EVENT_STARTED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  applyMeetingInteractions,
  type CalendarEventParticipantLink,
} from 'src/utils/apply-meeting-interactions';

const QUERY_MAX_RECORDS = 200;

const handler = async (): Promise<void> => {
  const client = new CoreApiClient();

  const now = new Date();
  const windowStart = new Date(
    now.getTime() -
      (CALENDAR_CRON_INTERVAL_MINUTES + CALENDAR_CRON_SECURITY_OVERLAP_MINUTES) *
        60 *
        1000,
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

  const linkByKey = new Map<string, CalendarEventParticipantLink>();
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
            personId: true,
            calendarEventId: true,
          },
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
      },
    });

    for (const edge of calendarEventParticipants?.edges ?? []) {
      const { personId, calendarEventId } = edge.node;

      if (personId && calendarEventId) {
        linkByKey.set(`${personId}:${calendarEventId}`, {
          personId,
          calendarEventId,
        });
      }
    }
    participantsHasNextPage =
      calendarEventParticipants?.pageInfo.hasNextPage ?? false;
    participantsCursor =
      calendarEventParticipants?.pageInfo.endCursor ?? undefined;
  }

  await applyMeetingInteractions(client, [...linkByKey.values()]);
};

export default defineLogicFunction({
  universalIdentifier:
    CALENDAR_EVENT_STARTED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-calendar-event-started',
  description:
    'Updates last-contacted fields for participants of calendar events whose start time just passed.',
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  cronTriggerSettings: {
    pattern: `*/${CALENDAR_CRON_INTERVAL_MINUTES} * * * *`,
  },
  handler,
});
