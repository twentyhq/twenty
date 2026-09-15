import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { queryEdgesInBatches } from 'src/logic-functions/data/query-edges-in-batches.util';

export const fetchReadablePersonIds = async ({
  client,
  personIds,
}: {
  client: CoreApiClient;
  personIds: string[];
}): Promise<string[]> => {
  const readablePeople = await queryEdgesInBatches<
    string,
    { id?: string | null }
  >(personIds, async (batch) => {
    const { people } = await client.query({
      people: {
        __args: { filter: { id: { in: batch } }, first: batch.length },
        edges: { node: { id: true } },
      },
    });

    return people;
  });

  return readablePeople.map(({ id }) => id).filter(isNonEmptyString);
};
