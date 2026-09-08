import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type GranolaNote } from 'src/logic-functions/types/granola-api.type';
import { escapeIlikePattern } from 'src/logic-functions/utils/escape-ilike-pattern.util';
import { getUnambiguousCalendarEventIdFromConnection } from 'src/logic-functions/utils/get-unambiguous-calendar-event-id-from-connection.util';

export const findMatchingCalendarEventOrThrow = async ({
  coreApiClient,
  note,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  note: Pick<GranolaNote, 'calendar_event'>;
}): Promise<string | undefined> => {
  const calendarEvent = note.calendar_event;
  if (!isDefined(calendarEvent)) {
    return undefined;
  }
  if (isNonEmptyString(calendarEvent.calendar_event_id)) {
    const result = await coreApiClient.query({
      calendarChannelEventAssociations: {
        __args: {
          filter: { eventExternalId: { eq: calendarEvent.calendar_event_id } },
          first: 100,
        },
        edges: { node: { calendarEventId: true } },
        pageInfo: { hasNextPage: true },
      },
    });
    const connection = result.calendarChannelEventAssociations;
    if (
      isDefined(connection) &&
      (connection.pageInfo.hasNextPage || isNonEmptyArray(connection.edges))
    ) {
      return getUnambiguousCalendarEventIdFromConnection(connection);
    }
  }
  const inviteeEmails = [
    ...new Set(
      calendarEvent.invitees
        .map(({ email }) => email.trim())
        .filter(isNonEmptyString),
    ),
  ];
  if (
    !isNonEmptyString(calendarEvent.scheduled_start_time) ||
    !isNonEmptyArray(inviteeEmails)
  ) {
    return undefined;
  }
  const result = await coreApiClient.query({
    calendarEventParticipants: {
      __args: {
        filter: {
          calendarEvent: {
            startsAt: { eq: calendarEvent.scheduled_start_time },
            isCanceled: { eq: false },
          },
          or: inviteeEmails.map((email) => ({
            handle: { ilike: escapeIlikePattern(email) },
          })),
        },
        first: 100,
      },
      edges: { node: { calendarEventId: true } },
      pageInfo: { hasNextPage: true },
    },
  });
  return getUnambiguousCalendarEventIdFromConnection(
    result.calendarEventParticipants,
  );
};
