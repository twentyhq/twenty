import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { queryEdgesInBatches } from 'src/logic-functions/data/query-edges-in-batches.util';
import { type ExistingTwentyPerson } from 'src/logic-functions/types/twenty-person.type';

export type ReadablePerson = Pick<ExistingTwentyPerson, 'id' | 'updatedAt'>;

export const fetchReadablePeople = async ({
  client,
  personIds,
}: {
  client: CoreApiClient;
  personIds: string[];
}): Promise<ReadablePerson[]> => {
  const readablePeople = await queryEdgesInBatches<
    string,
    { id?: string | null; updatedAt?: string | null }
  >(personIds, async (batch) => {
    const { people } = await client.query({
      people: {
        __args: { filter: { id: { in: batch } }, first: batch.length },
        edges: { node: { id: true, updatedAt: true } },
      },
    });

    return people;
  });

  return readablePeople.flatMap(({ id, updatedAt }) =>
    isNonEmptyString(id) ? [{ id, updatedAt }] : [],
  );
};
