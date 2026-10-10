import { type CoreApiClient } from 'twenty-client-sdk/core';

import { collectRecordsById } from 'src/utils/collect-records-by-id';
import { hasLastContactChanged } from 'src/utils/has-last-contact-changed';
import {
  buildPersonAggregates,
  buildPersonUpdateData,
  PERSON_LAST_CONTACT_FIELD_NAMES,
} from 'src/utils/person-last-contact-aggregation';
import {
  type RecordUpsert,
  upsertRecordsInBatches,
} from 'src/utils/upsert-records-in-batches';

export const backfillPeopleLastContact = async (
  client: CoreApiClient,
  personIds: string[],
): Promise<void> => {
  const aggByPersonId = await buildPersonAggregates(client, personIds);

  // Read right before the write: the upsert restores a person trashed since
  // the batch was listed and recreates one deleted since.
  const currentPersonById = await collectRecordsById(
    client,
    'people',
    personIds,
    PERSON_LAST_CONTACT_FIELD_NAMES,
  );

  const upserts: RecordUpsert[] = [];

  for (const personId of personIds) {
    const currentPerson = currentPersonById.get(personId);

    if (!currentPerson) {
      continue;
    }

    const data = buildPersonUpdateData(aggByPersonId.get(personId));

    if (hasLastContactChanged(currentPerson, data)) {
      upserts.push({ id: personId, ...data });
    }
  }

  await upsertRecordsInBatches(client, 'createPeople', upserts);
};
