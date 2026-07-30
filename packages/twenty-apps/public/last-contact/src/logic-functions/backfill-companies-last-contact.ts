import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import {
  BACKFILL_BATCH_SIZE,
  BACKFILL_COMPANIES_ROUTE_PATH,
  BACKFILL_SLEEP_MS,
} from 'src/constants/backfill';
import { BACKFILL_COMPANIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import { collectPeopleByCompany } from 'src/utils/collect-people-by-company';
import {
  buildPersonAggregates,
  buildRelatedUpdateData,
  pickLatestLastContact,
  pickPersonLastContact,
} from 'src/utils/person-last-contact-aggregation';
import { postToOwnRoute, sleep } from 'src/utils/post-to-own-route';

type BackfillBody = { cursor?: string };

const handler = async (
  payload: RoutePayload<BackfillBody>,
): Promise<object> => {
  const client = new CoreApiClient();
  const cursor = payload.body?.cursor;

  const { companies } = await executeWithRetry(() =>
    client.query({
      companies: {
        __args: { first: BACKFILL_BATCH_SIZE, after: cursor },
        edges: { node: { id: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    }),
  );

  const companyIds = (companies?.edges ?? [])
    .map((edge: { node: { id: string } }) => edge.node.id)
    .filter(Boolean);

  if (companyIds.length === 0) {
    return { outcome: 'done' };
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

  if (companies?.pageInfo.hasNextPage && companies.pageInfo.endCursor) {
    await sleep(BACKFILL_SLEEP_MS);
    await postToOwnRoute({
      path: BACKFILL_COMPANIES_ROUTE_PATH,
      body: { cursor: companies.pageInfo.endCursor },
    });
  }

  return { outcome: 'processed', count: companyIds.length };
};

export default defineLogicFunction({
  universalIdentifier: BACKFILL_COMPANIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-companies-last-contact',
  description:
    'Backfills last-contact fields for a page of companies from the most recent contact of their people, then re-triggers itself with the next cursor.',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: BACKFILL_COMPANIES_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
