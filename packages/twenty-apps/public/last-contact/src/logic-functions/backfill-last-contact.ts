import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { applyUpdates } from 'src/utils/last-contact/apply-updates';
import { buildPersonAggregates } from 'src/utils/last-contact/build-person-aggregates';
import { buildPersonData } from 'src/utils/last-contact/build-person-data';
import {
  buildRelatedData,
  personLastContact,
} from 'src/utils/last-contact/build-related-data';
import { collectOpportunities } from 'src/utils/last-contact/collect-opportunities';
import { collectPersonCompanies } from 'src/utils/last-contact/collect-person-companies';
import {
  type LastContact,
  type RecordUpdate,
} from 'src/utils/last-contact/types';

const handler = async (): Promise<void> => {
  const client = new CoreApiClient();

  const [aggByPersonId, personCompanies, opportunities] = await Promise.all([
    buildPersonAggregates(client),
    collectPersonCompanies(client),
    collectOpportunities(client),
  ]);

  const personUpdates = [...aggByPersonId.entries()].map(([personId, agg]) => ({
    id: personId,
    data: buildPersonData(agg),
  }));

  const companyLastContact = new Map<string, LastContact>();
  for (const [personId, agg] of aggByPersonId) {
    const contact = personLastContact(agg);
    if (!contact) {
      continue;
    }
    const companyId = personCompanies.get(personId);
    if (!companyId) {
      continue;
    }
    const existing = companyLastContact.get(companyId);
    if (!existing || contact.at > existing.at) {
      companyLastContact.set(companyId, contact);
    }
  }

  const opportunityUpdates = opportunities
    .map((opportunity): RecordUpdate | undefined => {
      const pointOfContactAgg = opportunity.pointOfContactId
        ? aggByPersonId.get(opportunity.pointOfContactId)
        : undefined;
      const lastContact = pointOfContactAgg
        ? personLastContact(pointOfContactAgg)
        : undefined;
      return lastContact
        ? { id: opportunity.id, data: buildRelatedData(lastContact) }
        : undefined;
    })
    .filter((update): update is RecordUpdate => Boolean(update));

  const companyUpdates: RecordUpdate[] = [...companyLastContact.entries()].map(
    ([companyId, contact]) => ({
      id: companyId,
      data: buildRelatedData(contact),
    }),
  );

  await applyUpdates(client, 'updatePerson', personUpdates);
  await applyUpdates(client, 'updateCompany', companyUpdates);
  await applyUpdates(client, 'updateOpportunity', opportunityUpdates);
};

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-last-contact',
  description:
    'Fills person, company and opportunity last-contact fields from existing messages and calendar events after installation.',
  timeoutSeconds: 300,
  shouldRunOnVersionUpgrade: true,
  handler,
});
