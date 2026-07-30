import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import {
  BACKFILL_BATCH_SIZE,
  BACKFILL_OPPORTUNITIES_ROUTE_PATH,
  BACKFILL_SLEEP_MS,
} from 'src/constants/backfill';
import { BACKFILL_OPPORTUNITIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  buildPersonAggregates,
  buildRelatedUpdateData,
  pickPersonLastContact,
} from 'src/utils/person-last-contact-aggregation';
import { postToOwnRoute, sleep } from 'src/utils/post-to-own-route';

type BackfillBody = { cursor?: string };
type OpportunityNode = { id: string; pointOfContactId: string | null };

const handler = async (
  payload: RoutePayload<BackfillBody>,
): Promise<object> => {
  const client = new CoreApiClient();
  const cursor = payload.body?.cursor;

  const { opportunities } = await executeWithRetry(() =>
    client.query({
      opportunities: {
        __args: { first: BACKFILL_BATCH_SIZE, after: cursor },
        edges: { node: { id: true, pointOfContactId: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    }),
  );

  const nodes: OpportunityNode[] = (opportunities?.edges ?? [])
    .map((edge: { node: OpportunityNode }) => edge.node)
    .filter((node: OpportunityNode) => Boolean(node.id));

  if (nodes.length === 0) {
    return { outcome: 'done' };
  }

  const personIds = [
    ...new Set(
      nodes
        .map((node) => node.pointOfContactId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const aggByPersonId = await buildPersonAggregates(client, personIds);

  for (const node of nodes) {
    const lastContact = node.pointOfContactId
      ? pickPersonLastContact(aggByPersonId.get(node.pointOfContactId))
      : undefined;

    if (!lastContact) {
      continue;
    }

    await executeWithRetry(() =>
      client.mutation({
        updateOpportunity: {
          __args: { id: node.id, data: buildRelatedUpdateData(lastContact) },
          id: true,
        },
      }),
    );
  }

  if (opportunities?.pageInfo.hasNextPage && opportunities.pageInfo.endCursor) {
    await sleep(BACKFILL_SLEEP_MS);
    await postToOwnRoute({
      path: BACKFILL_OPPORTUNITIES_ROUTE_PATH,
      body: { cursor: opportunities.pageInfo.endCursor },
    });
  }

  return { outcome: 'processed', count: nodes.length };
};

export default defineLogicFunction({
  universalIdentifier:
    BACKFILL_OPPORTUNITIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-opportunities-last-contact',
  description:
    'Backfills last-contact fields for a page of opportunities from their point of contact, then re-triggers itself with the next cursor.',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: BACKFILL_OPPORTUNITIES_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
