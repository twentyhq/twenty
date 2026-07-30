import { type CoreApiClient } from 'twenty-client-sdk/core';

import { applyUpdates } from 'src/utils/last-contact/apply-updates';
import { buildPersonAggregates } from 'src/utils/last-contact/build-person-aggregates';
import { buildPersonData } from 'src/utils/last-contact/build-person-data';
import { collectExistingRecordIds } from 'src/utils/last-contact/collect-existing-record-ids';

export const recomputePeople = async (
  client: CoreApiClient,
  personIds: string[],
): Promise<number> => {
  const existingPersonIds = await collectExistingRecordIds(
    client,
    'people',
    personIds,
  );

  const aggByPersonId = await buildPersonAggregates(client, existingPersonIds);

  const updates = existingPersonIds.map((personId) => ({
    id: personId,
    data: buildPersonData(aggByPersonId.get(personId) ?? {}, 'overwrite'),
  }));

  await applyUpdates(client, 'updatePerson', updates);

  return updates.length;
};
