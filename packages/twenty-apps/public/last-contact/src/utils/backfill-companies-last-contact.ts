import { type CoreApiClient } from 'twenty-client-sdk/core';

import { collectPeopleByCompany } from 'src/utils/collect-people-by-company';
import {
  buildRelatedUpdateData,
  buildPersonAggregates,
  pickLatestLastContact,
  pickPersonLastContact,
} from 'src/utils/person-last-contact-aggregation';
import {
  type RecordUpsert,
  upsertRecordsInBatches,
} from 'src/utils/upsert-records-in-batches';

export const backfillCompaniesLastContact = async (
  client: CoreApiClient,
  companyIds: string[],
): Promise<void> => {
  const peopleByCompanyId = await collectPeopleByCompany(client, companyIds);
  const personIds = [...new Set([...peopleByCompanyId.values()].flat())];
  const aggByPersonId = await buildPersonAggregates(client, personIds);

  const upserts: RecordUpsert[] = [];

  for (const companyId of companyIds) {
    const lastContact = pickLatestLastContact(
      (peopleByCompanyId.get(companyId) ?? [])
        .map((personId) => pickPersonLastContact(aggByPersonId.get(personId)))
        .filter((contact) => contact !== undefined),
    );

    if (!lastContact) {
      continue;
    }

    upserts.push({ id: companyId, ...buildRelatedUpdateData(lastContact) });
  }

  await upsertRecordsInBatches(client, 'createCompanies', upserts);
};
