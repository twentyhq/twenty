import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import {
  type BackfillBatchResult,
  BACKFILL_COMPANIES_ROUTE_PATH,
} from 'src/constants/backfill';
import { BACKFILL_COMPANIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getBackfillBatchSize } from 'src/utils/backfill-settings';
import { collectPeopleByCompany } from 'src/utils/collect-people-by-company';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  buildRelatedUpdateData,
  buildPersonAggregates,
  pickLatestLastContact,
  pickPersonLastContact,
} from 'src/utils/person-last-contact-aggregation';

type BackfillBody = { cursor?: string };

const handler = async (
  payload: RoutePayload<BackfillBody>,
): Promise<BackfillBatchResult> => {
  const client = new CoreApiClient();
  const cursor = payload.body?.cursor;

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
    return { nextCursor: null, count: 0 };
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

  return { nextCursor, count: companyIds.length };
};

export default defineLogicFunction({
  universalIdentifier: BACKFILL_COMPANIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-companies-last-contact',
  description:
    'Backfills last-contact fields for one page of companies from the most recent contact of their people, returning the next cursor to the backfill orchestrator.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: BACKFILL_COMPANIES_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
