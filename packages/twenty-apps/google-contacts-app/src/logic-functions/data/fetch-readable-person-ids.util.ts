import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_SIZE } from 'src/constants/batch-sizes.constant';
import { chunk } from 'src/logic-functions/data/chunk.util';
import { executeWithRetry } from 'src/logic-functions/data/execute-with-retry.util';

export const fetchReadablePersonIds = async ({
  client,
  personIds,
}: {
  client: CoreApiClient;
  personIds: string[];
}): Promise<string[]> => {
  const readablePersonIds: string[] = [];

  for (const personIdsBatch of chunk(personIds, BATCH_SIZE)) {
    const { people } = await executeWithRetry(() =>
      client.query({
        people: {
          __args: {
            filter: { id: { in: personIdsBatch } },
            first: personIdsBatch.length,
          },
          edges: { node: { id: true } },
        },
      }),
    );

    for (const edge of people?.edges ?? []) {
      if (isNonEmptyString(edge.node.id)) {
        readablePersonIds.push(edge.node.id);
      }
    }
  }

  return readablePersonIds;
};
