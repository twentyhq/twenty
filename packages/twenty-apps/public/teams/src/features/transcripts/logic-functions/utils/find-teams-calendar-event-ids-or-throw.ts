import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_CALENDAR_EVENT_LOOKUP_CONCURRENCY } from 'src/features/transcripts/logic-functions/constants/teams-calendar-event-lookup-concurrency';
import { TWENTY_QUERY_MAX_RECORDS } from 'src/features/transcripts/logic-functions/constants/twenty-query-max-records';
import { type CalendarChannelEventAssociation } from 'src/features/transcripts/logic-functions/types/calendar-channel-event-association.type';
import { type CalendarEvent } from 'src/features/transcripts/logic-functions/types/calendar-event.type';
import { type TeamsCalendarReference } from 'src/features/transcripts/logic-functions/types/teams-calendar-reference.type';
import { chunkIntoBatches } from 'src/features/transcripts/logic-functions/utils/chunk-into-batches';
import { getTeamsCalendarEventICalUIdOrThrow } from 'src/features/transcripts/logic-functions/utils/get-teams-calendar-event-ical-uid-or-throw';
import { groupCalendarEventIdsByKey } from 'src/features/transcripts/logic-functions/utils/group-calendar-event-ids-by-key';
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

const listAllNodesInBatchesOrThrow = async <TNode>({
  coreApiClient,
  objectName,
  values,
  buildFilter,
  node,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  objectName: 'calendarChannelEventAssociations' | 'calendarEvents';
  values: string[];
  buildFilter: (batch: string[]) => Record<string, unknown>;
  node: Record<keyof TNode, true>;
}): Promise<TNode[]> => {
  const nodes: TNode[] = [];

  for (const batch of chunkIntoBatches(values, TWENTY_QUERY_MAX_RECORDS)) {
    nodes.push(
      ...(await listAllNodesOrThrow<TNode>({
        coreApiClient,
        objectName,
        filter: buildFilter(batch),
        node,
      })),
    );
  }

  return nodes;
};

const listCalendarChannelEventAssociationsOrThrow = ({
  coreApiClient,
  eventExternalIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  eventExternalIds: string[];
}): Promise<CalendarChannelEventAssociation[]> =>
  listAllNodesInBatchesOrThrow<CalendarChannelEventAssociation>({
    coreApiClient,
    objectName: 'calendarChannelEventAssociations',
    values: eventExternalIds,
    buildFilter: (eventExternalIdBatch) => ({
      eventExternalId: { in: eventExternalIdBatch },
    }),
    node: { eventExternalId: true, calendarEventId: true },
  });

const listCalendarEventsByICalUidOrThrow = ({
  coreApiClient,
  iCalUIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  iCalUIds: string[];
}): Promise<CalendarEvent[]> =>
  listAllNodesInBatchesOrThrow<CalendarEvent>({
    coreApiClient,
    objectName: 'calendarEvents',
    values: iCalUIds,
    buildFilter: (iCalUIdBatch) => ({
      iCalUid: { in: iCalUIdBatch },
      isCanceled: { eq: false },
    }),
    node: { id: true, iCalUid: true },
  });

const addMissingICalUIdsOrThrow = async ({
  accessToken,
  references,
}: {
  accessToken: string;
  references: TeamsCalendarReference[];
}): Promise<TeamsCalendarReference[]> => {
  const missingEventExternalIds = [
    ...new Set(
      references
        .filter(({ iCalUId }) => !isDefined(iCalUId))
        .map(({ eventExternalId }) => eventExternalId),
    ),
  ];
  const iCalUIdsByEventExternalId = new Map<string, string | undefined>();

  for (const eventExternalIdBatch of chunkIntoBatches(
    missingEventExternalIds,
    TEAMS_CALENDAR_EVENT_LOOKUP_CONCURRENCY,
  )) {
    const iCalUIds = await Promise.all(
      eventExternalIdBatch.map((eventId) =>
        getTeamsCalendarEventICalUIdOrThrow({ accessToken, eventId }),
      ),
    );

    eventExternalIdBatch.forEach((eventExternalId, index) =>
      iCalUIdsByEventExternalId.set(eventExternalId, iCalUIds[index]),
    );
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
  const calendarEventIdsByEventExternalId = groupCalendarEventIdsByKey(
    calendarChannelEventAssociations.map(
      ({ eventExternalId, calendarEventId }): [string, string] => [
        eventExternalId,
        calendarEventId,
      ],
    ),
  );
  const isUniquelyAssociated = ({ eventExternalId }: TeamsCalendarReference) =>
    calendarEventIdsByEventExternalId.get(eventExternalId)?.size === 1;
  const uniquelyAssociatedReferences = references.filter(isUniquelyAssociated);
  const iCalUIdFallbackReferences = await addMissingICalUIdsOrThrow({
    accessToken,
    references: references.filter(
      (reference) => !isUniquelyAssociated(reference),
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
