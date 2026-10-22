import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { TWENTY_QUERY_MAX_RECORDS } from 'src/features/transcripts/logic-functions/constants/twenty-query-max-records';
import { chunkIntoBatches } from 'src/features/transcripts/logic-functions/utils/chunk-into-batches';

type CallRecordingConnection = {
  edges: { node: { id: string; calendarEventId: string | null } }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

const addLatestCallRecordingIdsOrThrow = async ({
  coreApiClient,
  applicationId,
  calendarEventIds,
  latestCallRecordingIdByCalendarEventId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  applicationId: string;
  calendarEventIds: string[];
  latestCallRecordingIdByCalendarEventId: Map<string, string>;
}): Promise<void> => {
  let after: string | undefined;

  // A recurring series links all its recordings to one event, so page until each event has one.
  while (
    calendarEventIds.some(
      (calendarEventId) =>
        !latestCallRecordingIdByCalendarEventId.has(calendarEventId),
    )
  ) {
    const queryResult: { callRecordings?: CallRecordingConnection } =
      await coreApiClient.query({
        callRecordings: {
          __args: {
            filter: {
              calendarEventId: { in: calendarEventIds },
              applicationId: { eq: applicationId },
            },
            orderBy: [{ startedAt: 'DescNullsLast' }],
            first: TWENTY_QUERY_MAX_RECORDS,
            ...(isDefined(after) ? { after } : {}),
          },
          edges: { node: { id: true, calendarEventId: true } },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      });
    const connection = queryResult.callRecordings;

    for (const { node } of connection?.edges ?? []) {
      if (
        isNonEmptyString(node.calendarEventId) &&
        !latestCallRecordingIdByCalendarEventId.has(node.calendarEventId)
      ) {
        latestCallRecordingIdByCalendarEventId.set(
          node.calendarEventId,
          node.id,
        );
      }
    }

    const endCursor = connection?.pageInfo.endCursor;

    if (!connection?.pageInfo.hasNextPage || !isNonEmptyString(endCursor)) {
      return;
    }

    after = endCursor;
  }
};

export const findLatestTeamsCallRecordingIdsForCalendarEventsOrThrow = async ({
  coreApiClient,
  calendarEventIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  calendarEventIds: string[];
}): Promise<string[]> => {
  const applicationId = process.env.APPLICATION_ID;

  if (!isNonEmptyString(applicationId)) {
    return [];
  }

  const latestCallRecordingIdByCalendarEventId = new Map<string, string>();

  for (const batch of chunkIntoBatches(
    calendarEventIds,
    TWENTY_QUERY_MAX_RECORDS,
  )) {
    await addLatestCallRecordingIdsOrThrow({
      coreApiClient,
      applicationId,
      calendarEventIds: batch,
      latestCallRecordingIdByCalendarEventId,
    });
  }

  return [...latestCallRecordingIdByCalendarEventId.values()];
};
