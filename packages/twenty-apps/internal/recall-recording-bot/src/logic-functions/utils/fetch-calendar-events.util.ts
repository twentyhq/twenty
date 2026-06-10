import { CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { type CalendarEventParticipantRecord } from 'src/logic-functions/types/calendar-event-participant-record.type';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { fetchAllNodes } from 'src/logic-functions/utils/fetch-all-nodes.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

export const fetchCalendarEventsByIds = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<CalendarEventRecord[]> => {
  const uniqueCalendarEventIds = getUniqueSortedIds(calendarEventIds);

  if (uniqueCalendarEventIds.length === 0) {
    return [];
  }

  return fetchCalendarEventsByFilter(client, {
    id: { in: uniqueCalendarEventIds },
  });
};

export const fetchCalendarEventsByStartsAtValues = async (
  client: CoreApiClient,
  startsAtValues: string[],
): Promise<CalendarEventRecord[]> => {
  const uniqueStartsAtValues = [...new Set(startsAtValues)].sort();

  if (uniqueStartsAtValues.length === 0) {
    return [];
  }

  return fetchCalendarEventsByFilter(client, {
    startsAt: { in: uniqueStartsAtValues },
  });
};

const fetchCalendarEventsByFilter = async (
  client: CoreApiClient,
  filter: Record<string, unknown>,
): Promise<CalendarEventRecord[]> => {
  const calendarEventNodes = await fetchAllNodes(async (afterCursor) => {
    const queryResult = await client.query({
      calendarEvents: {
        __args: {
          filter,
          first: TWENTY_PAGE_SIZE,
          ...(afterCursor === undefined ? {} : { after: afterCursor }),
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
        edges: {
          node: {
            id: true,
            title: true,
            isCanceled: true,
            startsAt: true,
            endsAt: true,
            iCalUid: true,
            conferenceLink: {
              primaryLinkUrl: true,
            },
            recallRecordingBotPreference: true,
          },
        },
      },
    });

    return queryResult.calendarEvents;
  });

  const calendarEvents = calendarEventNodes.map((calendarEvent) => ({
    id: calendarEvent.id,
    title: calendarEvent.title ?? null,
    isCanceled: calendarEvent.isCanceled ?? false,
    startsAt: calendarEvent.startsAt ?? null,
    endsAt: calendarEvent.endsAt ?? null,
    iCalUid: calendarEvent.iCalUid ?? null,
    conferenceLink: calendarEvent.conferenceLink ?? null,
    recallRecordingBotPreference:
      typeof calendarEvent.recallRecordingBotPreference === 'string'
        ? calendarEvent.recallRecordingBotPreference
        : null,
  }));

  return attachParticipantsToCalendarEvents(client, calendarEvents);
};

const attachParticipantsToCalendarEvents = async (
  client: CoreApiClient,
  calendarEvents: CalendarEventRecord[],
): Promise<CalendarEventRecord[]> => {
  const calendarEventIds = getUniqueSortedIds(
    calendarEvents.map((calendarEvent) => calendarEvent.id),
  );
  const participants = await fetchCalendarEventParticipantsByCalendarEventIds(
    client,
    calendarEventIds,
  );
  const participantsByCalendarEventId = new Map<
    string,
    CalendarEventParticipantRecord[]
  >();

  for (const participant of participants) {
    const calendarEventId = participant.calendarEventId;

    if (calendarEventId === null) {
      continue;
    }

    participantsByCalendarEventId.set(calendarEventId, [
      ...(participantsByCalendarEventId.get(calendarEventId) ?? []),
      participant,
    ]);
  }

  return calendarEvents.map((calendarEvent) => ({
    ...calendarEvent,
    calendarEventParticipants:
      participantsByCalendarEventId.get(calendarEvent.id) ?? [],
  }));
};

const fetchCalendarEventParticipantsByCalendarEventIds = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<CalendarEventParticipantRecord[]> => {
  if (calendarEventIds.length === 0) {
    return [];
  }

  const participantNodes = await fetchAllNodes(async (afterCursor) => {
    const queryResult = await client.query({
      calendarEventParticipants: {
        __args: {
          filter: {
            calendarEventId: { in: calendarEventIds },
          },
          first: TWENTY_PAGE_SIZE,
          ...(afterCursor === undefined ? {} : { after: afterCursor }),
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
        edges: {
          node: {
            id: true,
            calendarEventId: true,
            workspaceMemberId: true,
          },
        },
      },
    });

    return queryResult.calendarEventParticipants;
  });

  return participantNodes.map((participant) => ({
    id: participant.id,
    calendarEventId: participant.calendarEventId ?? null,
    workspaceMemberId: participant.workspaceMemberId ?? null,
  }));
};
