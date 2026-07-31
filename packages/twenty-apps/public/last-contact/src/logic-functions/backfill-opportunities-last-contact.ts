import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import {
  type BackfillBatchResult,
  BACKFILL_OPPORTUNITIES_ROUTE_PATH,
} from 'src/constants/backfill';
import { BACKFILL_OPPORTUNITIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getBackfillBatchSize } from 'src/utils/backfill-settings';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  buildRelatedUpdateData,
  buildPersonAggregates,
  pickPersonLastContact,
} from 'src/utils/person-last-contact-aggregation';

type BackfillBody = { cursor?: string };
type OpportunityNode = { id: string; pointOfContactId: string | null };

const handler = async (
  payload: RoutePayload<BackfillBody>,
): Promise<BackfillBatchResult> => {
  const client = new CoreApiClient();
  const cursor = payload.body?.cursor;

  const { opportunities } = await executeWithRetry(() =>
    client.query({
      opportunities: {
        __args: { first: getBackfillBatchSize(), after: cursor },
        edges: { node: { id: true, pointOfContactId: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    }),
  );

  const nodes: OpportunityNode[] = (opportunities?.edges ?? [])
    .map((edge: { node: OpportunityNode }) => edge.node)
    .filter((node: OpportunityNode) => Boolean(node.id));

  if (nodes.length === 0) {
    return { nextCursor: null, count: 0 };
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

  const nextCursor =
    opportunities?.pageInfo.hasNextPage && opportunities.pageInfo.endCursor
      ? opportunities.pageInfo.endCursor
      : null;

  return { nextCursor, count: nodes.length };
};

export default defineLogicFunction({
  universalIdentifier:
    BACKFILL_OPPORTUNITIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-opportunities-last-contact',
  description:
    'Backfills last-contact fields for one page of opportunities from their point of contact, returning the next cursor to the backfill orchestrator.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: BACKFILL_OPPORTUNITIES_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
