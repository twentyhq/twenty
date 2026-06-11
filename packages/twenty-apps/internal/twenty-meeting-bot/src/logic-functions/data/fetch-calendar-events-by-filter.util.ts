import { isString, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { type CalendarEventParticipantRecord } from 'src/logic-functions/types/calendar-event-participant-record.type';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { fetchAllNodes } from 'src/logic-functions/data/fetch-all-nodes.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { stripRestrictedFieldValue } from 'src/logic-functions/data/strip-restricted-field-value.util';

export const fetchCalendarEventsByFilter = async (
  client: CoreApiClient,
  filter: Record<string, unknown>,
): Promise<CalendarEventRecord[]> => {
  const calendarEventNodes = await fetchAllNodes(async (afterCursor) => {
    const queryResult = await client.query({
      calendarEvents: {
        __args: {
          filter,
          first: TWENTY_PAGE_SIZE,
          ...(isUndefined(afterCursor) ? {} : { after: afterCursor }),
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
            meetingBotPreference: true,
          },
        },
      },
    });

    return queryResult.calendarEvents;
  });

  const calendarEvents = calendarEventNodes.map((calendarEvent) => ({
    id: calendarEvent.id,
    title: stripRestrictedFieldValue(calendarEvent.title ?? undefined),
    isCanceled: calendarEvent.isCanceled ?? false,
    startsAt: calendarEvent.startsAt ?? undefined,
    endsAt: calendarEvent.endsAt ?? undefined,
    iCalUid: calendarEvent.iCalUid ?? undefined,
    conferenceLinkUrl: isNonEmptyString(
      calendarEvent.conferenceLink?.primaryLinkUrl,
    )
      ? calendarEvent.conferenceLink.primaryLinkUrl
      : undefined,
    meetingBotPreference: isString(calendarEvent.meetingBotPreference)
      ? calendarEvent.meetingBotPreference
      : undefined,
  }));

  return attachParticipantsToCalendarEvents(client, calendarEvents);
};

const attachParticipantsToCalendarEvents = async (
  client: CoreApiClient,
  calendarEvents: Omit<CalendarEventRecord, 'calendarEventParticipants'>[],
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

    if (isUndefined(calendarEventId)) {
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
          ...(isUndefined(afterCursor) ? {} : { after: afterCursor }),
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

  const autoRecordEnabledWorkspaceMemberIds =
    await fetchAutoRecordEnabledWorkspaceMemberIds(
      client,
      getUniqueSortedIds(
        participantNodes.map((participant) => participant.workspaceMemberId),
      ),
    );

  return participantNodes.map((participant) => ({
    id: participant.id,
    calendarEventId: participant.calendarEventId ?? undefined,
    workspaceMemberId: participant.workspaceMemberId ?? undefined,
    workspaceMemberMeetingBotAutoRecordEnabled:
      isString(participant.workspaceMemberId) &&
      autoRecordEnabledWorkspaceMemberIds.has(participant.workspaceMemberId),
  }));
};

const fetchAutoRecordEnabledWorkspaceMemberIds = async (
  client: CoreApiClient,
  workspaceMemberIds: string[],
): Promise<Set<string>> => {
  if (workspaceMemberIds.length === 0) {
    return new Set();
  }

  const workspaceMemberNodes = await fetchAllNodes(async (afterCursor) => {
    const queryResult = await client.query({
      workspaceMembers: {
        __args: {
          filter: {
            id: { in: workspaceMemberIds },
          },
          first: TWENTY_PAGE_SIZE,
          ...(isUndefined(afterCursor) ? {} : { after: afterCursor }),
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
        edges: {
          node: {
            id: true,
            meetingBotAutoRecordEnabled: true,
          },
        },
      },
    });

    return queryResult.workspaceMembers;
  });

  return new Set(
    workspaceMemberNodes
      .filter(
        (workspaceMember) =>
          workspaceMember.meetingBotAutoRecordEnabled === true,
      )
      .map((workspaceMember) => workspaceMember.id),
  );
};
