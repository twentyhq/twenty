import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { type BackfillBatchPayload } from 'src/constants/backfill';
import { BACKFILL_COMPANIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildBackfillBatchArgs } from 'src/utils/backfill-batch-args';
import { getBackfillBatchSize } from 'src/utils/backfill-settings';
import { collectPeopleByCompany } from 'src/utils/collect-people-by-company';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  buildRelatedUpdateData,
  buildPersonAggregates,
  pickLatestLastContact,
  pickPersonLastContact,
} from 'src/utils/person-last-contact-aggregation';

const handler = async ({ batchId }: BackfillBatchPayload): Promise<object> => {
  const client = new CoreApiClient();

  const { companies } = await executeWithRetry(() =>
    client.query({
      companies: {
        __args: buildBackfillBatchArgs(batchId, getBackfillBatchSize()),
        edges: { node: { id: true } },
      },
    }),
  );

  const companyIds = (companies?.edges ?? [])
    .map((edge: { node: { id: string } }) => edge.node.id)
    .filter(Boolean);

  if (companyIds.length === 0) {
    return { batchId, count: 0 };
  }

  const peopleByCompanyId = await collectPeopleByCompany(client, companyIds);
  const personIds = [...new Set([...peopleByCompanyId.values()].flat())];
  const aggByPersonId = await buildPersonAggregates(client, personIds);

  for (const companyId of companyIds) {
    const lastContact = pickLatestLastContact(
      (peopleByCompanyId.get(companyId) ?? [])
        .map((personId) => pickPersonLastContact(aggByPersonId.get(personId)))
        .filter((contact) => contact !== undefined),
    );

    if (!lastContact) {
      continue;
    }

    await executeWithRetry(() =>
      client.mutation({
        updateCompany: {
          __args: { id: companyId, data: buildRelatedUpdateData(lastContact) },
          id: true,
        },
      }),
    );
  }

  return { batchId, count: companyIds.length };
};

export default defineLogicFunction({
  universalIdentifier: BACKFILL_COMPANIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-companies-last-contact',
  description:
    'Backfills last-contact fields for one batch of companies from the most recent contact of their people, resolved from the batch id in its payload.',
  timeoutSeconds: 120,
  handler,
});
