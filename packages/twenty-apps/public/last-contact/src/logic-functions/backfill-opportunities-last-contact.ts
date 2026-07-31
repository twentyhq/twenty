import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import {
  type BackfillState,
  BACKFILL_STATE_KV_KEY,
} from 'src/constants/backfill';
import { BACKFILL_OPPORTUNITIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { advanceBackfill } from 'src/utils/advance-backfill';
import { getBackfillBatchSize } from 'src/utils/backfill-settings';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  buildRelatedUpdateData,
  buildPersonAggregates,
  pickPersonLastContact,
} from 'src/utils/person-last-contact-aggregation';

const PHASE = 'opportunities';

type OpportunityNode = { id: string; pointOfContactId: string | null };

const handler = async (): Promise<object> => {
  const state = await kv.get<BackfillState>(BACKFILL_STATE_KV_KEY);

  if (!state || state.phase !== PHASE) {
    return { outcome: 'skipped', phase: state?.phase ?? null };
  }

  const client = new CoreApiClient();
  const cursor = state.cursor ?? undefined;

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
    return advanceBackfill({
      phase: PHASE,
      nextCursor: null,
      iterations: state.iterations,
    });
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

  return advanceBackfill({
    phase: PHASE,
    nextCursor,
    iterations: state.iterations,
  });
};

export default defineLogicFunction({
  universalIdentifier:
    BACKFILL_OPPORTUNITIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-opportunities-last-contact',
  description:
    'Backfills last-contact fields for one page of opportunities from their point of contact, then enqueues the next backfill batch.',
  timeoutSeconds: 120,
  handler,
});
