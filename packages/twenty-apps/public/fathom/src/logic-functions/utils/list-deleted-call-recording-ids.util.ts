import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_IDS_PER_QUERY } from 'src/constants/fathom.constant';

// Ids are unique, so one page per chunk already returns every match.
export const listDeletedCallRecordingIds = async ({
  coreApiClient,
  callRecordingIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingIds: string[];
}): Promise<Set<string>> => {
  const deletedCallRecordingIds = new Set<string>();

  for (
    let queryStart = 0;
    queryStart < callRecordingIds.length;
    queryStart += CALL_RECORDING_IDS_PER_QUERY
  ) {
    const queriedCallRecordingIds = callRecordingIds.slice(
      queryStart,
      queryStart + CALL_RECORDING_IDS_PER_QUERY,
    );

    const queryResult = await coreApiClient.query({
      callRecordings: {
        __args: {
          filter: {
            id: { in: queriedCallRecordingIds },
            deletedAt: { is: 'NOT_NULL' },
          },
          first: queriedCallRecordingIds.length,
        },
        edges: { node: { id: true } },
      },
    });

    for (const edge of queryResult.callRecordings?.edges ?? []) {
      const id = edge?.node?.id;

      if (isNonEmptyString(id)) {
        deletedCallRecordingIds.add(id);
      }
    }
  }

  return deletedCallRecordingIds;
};
