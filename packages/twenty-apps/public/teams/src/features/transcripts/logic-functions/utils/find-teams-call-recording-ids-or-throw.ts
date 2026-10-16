import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_QUERY_MAX_RECORDS } from 'src/features/transcripts/logic-functions/constants/twenty-query-max-records';
import { chunkIntoBatches } from 'src/features/transcripts/logic-functions/utils/chunk-into-batches';

export const findTeamsCallRecordingIdsOrThrow = async ({
  coreApiClient,
  callRecordingIds,
  calendarEventIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingIds: string[];
  calendarEventIds: string[];
}): Promise<string[]> => {
  const applicationId = process.env.APPLICATION_ID;

  if (!isNonEmptyString(applicationId)) {
    return [];
  }

  const selectionFilters =
    callRecordingIds.length > 0
      ? chunkIntoBatches(callRecordingIds, TWENTY_QUERY_MAX_RECORDS).map(
          (batch) => ({ id: { in: batch } }),
        )
      : chunkIntoBatches(calendarEventIds, TWENTY_QUERY_MAX_RECORDS).map(
          (batch) => ({ calendarEventId: { in: batch } }),
        );

  const teamsCallRecordingIds: string[] = [];

  for (const selectionFilter of selectionFilters) {
    const queryResult: {
      callRecordings?: { edges?: { node: { id: string } }[] };
    } = await coreApiClient.query({
      callRecordings: {
        __args: {
          filter: {
            and: [selectionFilter, { applicationId: { eq: applicationId } }],
          },
          first: TWENTY_QUERY_MAX_RECORDS,
        },
        edges: { node: { id: true } },
      },
    });

    teamsCallRecordingIds.push(
      ...(queryResult.callRecordings?.edges?.map(({ node }) => node.id) ?? []),
    );
  }

  return [...new Set(teamsCallRecordingIds)];
};
