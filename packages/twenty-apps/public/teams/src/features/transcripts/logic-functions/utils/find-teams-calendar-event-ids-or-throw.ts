import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { TWENTY_QUERY_MAX_RECORDS } from 'src/features/transcripts/logic-functions/constants/twenty-query-max-records';
import { type CalendarChannelEventAssociation } from 'src/features/transcripts/logic-functions/types/calendar-channel-event-association.type';
import { type CalendarEvent } from 'src/features/transcripts/logic-functions/types/calendar-event.type';
import { type TeamsCalendarReference } from 'src/features/transcripts/logic-functions/types/teams-calendar-reference.type';
import { chunkIntoBatches } from 'src/features/transcripts/logic-functions/utils/chunk-into-batches';
import { getTeamsCalendarEventICalUIdOrThrow } from 'src/features/transcripts/logic-functions/utils/get-teams-calendar-event-ical-uid-or-throw';
import { matchTeamsCalendarEventIds } from 'src/features/transcripts/logic-functions/utils/match-teams-calendar-event-ids';

type RecordConnection<TNode> = {
  edges: { node: TNode }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

const listAllNodesOrThrow = async <TNode>({
  coreApiClient,
  objectName,
  filter,
  node,
  after,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  objectName: 'calendarChannelEventAssociations' | 'calendarEvents';
  filter: Record<string, unknown>;
  node: Record<keyof TNode, true>;
  after?: string;
}): Promise<TNode[]> => {
  const result = await coreApiClient.query({
    [objectName]: {
      __args: {
        filter,
        first: TWENTY_QUERY_MAX_RECORDS,
        ...(isDefined(after) ? { after } : {}),
      },
      edges: { node },
      pageInfo: { hasNextPage: true, endCursor: true },
    },
  });
  const connection: RecordConnection<TNode> | undefined = result[objectName];
  const nodes = connection?.edges.map((edge) => edge.node) ?? [];
  const endCursor = connection?.pageInfo.endCursor;

  if (!connection?.pageInfo.hasNextPage || !isNonEmptyString(endCursor)) {
    return nodes;
  }

  return [
    ...nodes,
    ...(await listAllNodesOrThrow({
      coreApiClient,
      objectName,
      filter,
      node,
      after: endCursor,
    })),
  ];
};

const listCalendarChannelEventAssociationsOrThrow = async ({
  coreApiClient,
  eventExternalIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  eventExternalIds: string[];
}): Promise<CalendarChannelEventAssociation[]> => {
  const calendarChannelEventAssociations: CalendarChannelEventAssociation[] =
    [];

  for (const eventExternalIdBatch of chunkIntoBatches(
    eventExternalIds,
    TWENTY_QUERY_MAX_RECORDS,
  )) {
    calendarChannelEventAssociations.push(
      ...(await listAllNodesOrThrow<CalendarChannelEventAssociation>({
        coreApiClient,
        objectName: 'calendarChannelEventAssociations',
        filter: { eventExternalId: { in: eventExternalIdBatch } },
        node: { eventExternalId: true, calendarEventId: true },
      })),
    );
  }

  return calendarChannelEventAssociations;
};

const listCalendarEventsByICalUidOrThrow = async ({
  coreApiClient,
  iCalUIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  iCalUIds: string[];
}): Promise<CalendarEvent[]> => {
  const calendarEvents: CalendarEvent[] = [];

  for (const iCalUIdBatch of chunkIntoBatches(
    iCalUIds,
    TWENTY_QUERY_MAX_RECORDS,
  )) {
    calendarEvents.push(
      ...(await listAllNodesOrThrow<CalendarEvent>({
        coreApiClient,
        objectName: 'calendarEvents',
        filter: { iCalUid: { in: iCalUIdBatch }, isCanceled: { eq: false } },
        node: { id: true, iCalUid: true },
      })),
    );
  }

  return calendarEvents;
};

const addMissingICalUIdsOrThrow = async ({
  accessToken,
  references,
}: {
  accessToken: string;
  references: TeamsCalendarReference[];
}): Promise<TeamsCalendarReference[]> => {
  const iCalUIdsByEventExternalId = new Map<string, string | undefined>();

  for (const { eventExternalId, iCalUId } of references) {
    if (
      !isDefined(iCalUId) &&
      !iCalUIdsByEventExternalId.has(eventExternalId)
    ) {
      iCalUIdsByEventExternalId.set(
        eventExternalId,
        await getTeamsCalendarEventICalUIdOrThrow({
          accessToken,
          eventId: eventExternalId,
        }),
      );
    }
  }

  return references.map((reference) =>
    isDefined(reference.iCalUId)
      ? reference
      : {
          ...reference,
          iCalUId: iCalUIdsByEventExternalId.get(reference.eventExternalId),
        },
  );
};

const isUniquelyAssociated = ({
  reference,
  calendarChannelEventAssociations,
}: {
  reference: TeamsCalendarReference;
  calendarChannelEventAssociations: CalendarChannelEventAssociation[];
}): boolean =>
  new Set(
    calendarChannelEventAssociations
      .filter(
        ({ eventExternalId }) => eventExternalId === reference.eventExternalId,
      )
      .map(({ calendarEventId }) => calendarEventId),
  ).size === 1;

export const findTeamsCalendarEventIdsOrThrow = async ({
  accessToken,
  coreApiClient,
  references,
}: {
  accessToken: string;
  coreApiClient: Pick<CoreApiClient, 'query'>;
  references: TeamsCalendarReference[];
}): Promise<Map<string, string>> => {
  const calendarChannelEventAssociations =
    await listCalendarChannelEventAssociationsOrThrow({
      coreApiClient,
      eventExternalIds: [
        ...new Set(references.map(({ eventExternalId }) => eventExternalId)),
      ],
    });
  const uniquelyAssociatedReferences = references.filter((reference) =>
    isUniquelyAssociated({ reference, calendarChannelEventAssociations }),
  );
  const iCalUIdFallbackReferences = await addMissingICalUIdsOrThrow({
    accessToken,
    references: references.filter(
      (reference) =>
        !isUniquelyAssociated({ reference, calendarChannelEventAssociations }),
    ),
  });
  const fallbackICalUIds = [
    ...new Set(
      iCalUIdFallbackReferences
        .map(({ iCalUId }) => iCalUId)
        .filter(isNonEmptyString),
    ),
  ];

  return matchTeamsCalendarEventIds({
    references: [...uniquelyAssociatedReferences, ...iCalUIdFallbackReferences],
    calendarChannelEventAssociations,
    calendarEvents:
      fallbackICalUIds.length > 0
        ? await listCalendarEventsByICalUidOrThrow({
            coreApiClient,
            iCalUIds: fallbackICalUIds,
          })
        : [],
  });
};
