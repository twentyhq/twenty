import { isString, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { fetchAllNodes } from 'src/logic-functions/data/fetch-all-nodes.util';
import { fetchCalendarChannelOwners } from 'src/logic-functions/data/fetch-calendar-channel-owners.util';
import { fetchCalendarChannelEventAssociations } from 'src/logic-functions/data/fetch-calendar-channel-event-associations.util';
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

  return attachChannelOwnersToCalendarEvents(client, calendarEvents);
};

const attachChannelOwnersToCalendarEvents = async (
  client: CoreApiClient,
  calendarEvents: Omit<CalendarEventRecord, 'calendarChannelOwners'>[],
): Promise<CalendarEventRecord[]> => {
  const calendarEventIds = getUniqueSortedIds(
    calendarEvents.map((calendarEvent) => calendarEvent.id),
  );

  if (calendarEventIds.length === 0) {
    return [];
  }

  const associations = await fetchCalendarChannelEventAssociations(client, {
    calendarEventId: { in: calendarEventIds },
  });
  const channelOwners = await fetchCalendarChannelOwners(
    getUniqueSortedIds(
      associations.map((association) => association.calendarChannelId),
    ),
  );
  const autoRecordEnabledWorkspaceMemberIds =
    await fetchAutoRecordEnabledWorkspaceMemberIds(
      client,
      getUniqueSortedIds(
        channelOwners.map((channelOwner) => channelOwner.workspaceMemberId),
      ),
    );
  const ownerByCalendarChannelId = new Map(
    channelOwners.map((channelOwner) => [
      channelOwner.calendarChannelId,
      channelOwner,
    ]),
  );
  const ownersByCalendarEventId = new Map<
    string,
    CalendarEventRecord['calendarChannelOwners']
  >();

  for (const association of associations) {
    const owner = isString(association.calendarChannelId)
      ? ownerByCalendarChannelId.get(association.calendarChannelId)
      : undefined;

    if (isUndefined(association.calendarEventId) || isUndefined(owner)) {
      continue;
    }

    ownersByCalendarEventId.set(association.calendarEventId, [
      ...(ownersByCalendarEventId.get(association.calendarEventId) ?? []),
      {
        workspaceMemberId: owner.workspaceMemberId,
        workspaceMemberMeetingBotAutoRecordEnabled:
          isString(owner.workspaceMemberId) &&
          autoRecordEnabledWorkspaceMemberIds.has(owner.workspaceMemberId),
      },
    ]);
  }

  return calendarEvents.map((calendarEvent) => ({
    ...calendarEvent,
    calendarChannelOwners: ownersByCalendarEventId.get(calendarEvent.id) ?? [],
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
