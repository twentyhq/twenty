import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  buildPersonAggregates,
  buildPersonUpdateData,
} from 'src/utils/person-last-contact-aggregation';
import { upsertRecordsInBatches } from 'src/utils/upsert-records-in-batches';

export const backfillPeopleLastContact = async (
  client: CoreApiClient,
  personIds: string[],
): Promise<void> => {
  const aggByPersonId = await buildPersonAggregates(client, personIds);

  await upsertRecordsInBatches(
    client,
    'createPeople',
    personIds.map((personId) => ({
      id: personId,
      ...buildPersonUpdateData(aggByPersonId.get(personId)),
    })),
  );
};
