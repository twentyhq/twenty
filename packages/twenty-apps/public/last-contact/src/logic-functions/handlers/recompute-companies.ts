import { type CoreApiClient } from 'twenty-client-sdk/core';

import { applyUpdates } from 'src/utils/last-contact/apply-updates';
import { buildPersonAggregates } from 'src/utils/last-contact/build-person-aggregates';
import {
  buildRelatedData,
  personLastContact,
} from 'src/utils/last-contact/build-related-data';
import { collectExistingRecordIds } from 'src/utils/last-contact/collect-existing-record-ids';
import { collectPersonCompanies } from 'src/utils/last-contact/collect-person-companies';
import { type LastContact } from 'src/utils/last-contact/types';

export const recomputeCompanies = async (
  client: CoreApiClient,
  companyIds: string[],
): Promise<number> => {
  const existingCompanyIds = await collectExistingRecordIds(
    client,
    'companies',
    companyIds,
  );

  const companyByPersonId = await collectPersonCompanies(
    client,
    existingCompanyIds,
  );
  const aggByPersonId = await buildPersonAggregates(client, [
    ...companyByPersonId.keys(),
  ]);

  const lastContactByCompanyId = new Map<string, LastContact>();
  for (const [personId, companyId] of companyByPersonId) {
    const contact = personLastContact(aggByPersonId.get(personId) ?? {});
    if (!contact) {
      continue;
    }
    const existing = lastContactByCompanyId.get(companyId);
    if (!existing || contact.at > existing.at) {
      lastContactByCompanyId.set(companyId, contact);
    }
  }

  const updates = existingCompanyIds.map((companyId) => ({
    id: companyId,
    data: buildRelatedData(lastContactByCompanyId.get(companyId)),
  }));

  await applyUpdates(client, 'updateCompany', updates);

  return updates.length;
};
