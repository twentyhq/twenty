import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type GranolaNote } from 'src/logic-functions/types/granola-api.type';
import { escapeIlikePattern } from 'src/logic-functions/utils/escape-ilike-pattern.util';
import { getSingleDistinctCalendarEventId } from 'src/logic-functions/utils/get-single-distinct-calendar-event-id.util';

type CalendarEventMatches = {
  pageInfo: { hasNextPage: boolean };
  edges: { node: { calendarEventId: string | null } }[];
};

export const findMatchingCalendarEventOrThrow = async ({
  coreApiClient,
  note,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  note: Pick<GranolaNote, 'calendar_event'>;
}): Promise<string | undefined> => {
  const granolaCalendarEvent = note.calendar_event;

  if (!isDefined(granolaCalendarEvent)) {
    return undefined;
  }

  if (isNonEmptyString(granolaCalendarEvent.calendar_event_id)) {
    const result = await coreApiClient.query({
      calendarChannelEventAssociations: {
        __args: {
          filter: {
            eventExternalId: { eq: granolaCalendarEvent.calendar_event_id },
          },
          first: 100,
        },
        edges: { node: { calendarEventId: true } },
        pageInfo: { hasNextPage: true },
      },
    });
    const calendarChannelEventAssociations: CalendarEventMatches | undefined =
      result.calendarChannelEventAssociations;

    if (calendarChannelEventAssociations?.pageInfo.hasNextPage) {
      return undefined;
    }

    if (isNonEmptyArray(calendarChannelEventAssociations?.edges)) {
      const matchingCalendarEventIds =
        calendarChannelEventAssociations.edges.map(
          ({ node }) => node.calendarEventId,
        );

      return getSingleDistinctCalendarEventId(matchingCalendarEventIds);
    }
  }

  const inviteeEmails = [
    ...new Set(
      granolaCalendarEvent.invitees
        .map(({ email }) => email.trim())
        .filter(isNonEmptyString),
    ),
  ];

  if (
    !isNonEmptyString(granolaCalendarEvent.scheduled_start_time) ||
    !isNonEmptyArray(inviteeEmails)
  ) {
    return undefined;
  }

  const result = await coreApiClient.query({
    calendarEventParticipants: {
      __args: {
        filter: {
          calendarEvent: {
            startsAt: { eq: granolaCalendarEvent.scheduled_start_time },
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
  const calendarEventParticipants: CalendarEventMatches | undefined =
    result.calendarEventParticipants;

  if (
    !isDefined(calendarEventParticipants) ||
    calendarEventParticipants.pageInfo.hasNextPage
  ) {
    return undefined;
  }

  const matchingCalendarEventIds = calendarEventParticipants.edges.map(
    ({ node }) => node.calendarEventId,
  );

  return getSingleDistinctCalendarEventId(matchingCalendarEventIds);
};
