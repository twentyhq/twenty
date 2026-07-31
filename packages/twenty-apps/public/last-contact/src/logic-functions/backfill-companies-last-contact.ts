import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import {
  type BackfillState,
  BACKFILL_STATE_KV_KEY,
} from 'src/constants/backfill';
import { BACKFILL_COMPANIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { advanceBackfill } from 'src/utils/advance-backfill';
import { getBackfillBatchSize } from 'src/utils/backfill-settings';
import { collectPeopleByCompany } from 'src/utils/collect-people-by-company';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  buildRelatedUpdateData,
  buildPersonAggregates,
  pickLatestLastContact,
  pickPersonLastContact,
} from 'src/utils/person-last-contact-aggregation';

const PHASE = 'companies';

const handler = async (): Promise<object> => {
  const state = await kv.get<BackfillState>(BACKFILL_STATE_KV_KEY);

  if (!state || state.phase !== PHASE) {
    return { outcome: 'skipped', phase: state?.phase ?? null };
  }

  const client = new CoreApiClient();
  const cursor = state.cursor ?? undefined;

  const { companies } = await executeWithRetry(() =>
    client.query({
      companies: {
        __args: { first: getBackfillBatchSize(), after: cursor },
        edges: { node: { id: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    }),
  );

  const companyIds = (companies?.edges ?? [])
    .map((edge: { node: { id: string } }) => edge.node.id)
    .filter(Boolean);

  if (companyIds.length === 0) {
    return advanceBackfill({
      phase: PHASE,
      nextCursor: null,
      iterations: state.iterations,
    });
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

  const nextCursor =
    companies?.pageInfo.hasNextPage && companies.pageInfo.endCursor
      ? companies.pageInfo.endCursor
      : null;

  return advanceBackfill({
    phase: PHASE,
    nextCursor,
    iterations: state.iterations,
  });
};

export default defineLogicFunction({
  universalIdentifier: BACKFILL_COMPANIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-companies-last-contact',
  description:
    'Backfills last-contact fields for one page of companies from the most recent contact of their people, then enqueues the next backfill batch.',
  timeoutSeconds: 120,
  handler,
});
