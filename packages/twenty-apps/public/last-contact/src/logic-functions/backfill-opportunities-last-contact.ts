import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { type BackfillBatchPayload } from 'src/constants/backfill';
import { BACKFILL_OPPORTUNITIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildBackfillBatchArgs } from 'src/utils/backfill-batch-args';
import { getBackfillBatchSize } from 'src/utils/backfill-settings';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  buildRelatedUpdateData,
  buildPersonAggregates,
  pickPersonLastContact,
} from 'src/utils/person-last-contact-aggregation';

type OpportunityNode = { id: string; pointOfContactId: string | null };

const handler = async ({ batchId }: BackfillBatchPayload): Promise<object> => {
  const client = new CoreApiClient();

  const { opportunities } = await executeWithRetry(() =>
    client.query({
      opportunities: {
        __args: buildBackfillBatchArgs(batchId, getBackfillBatchSize()),
        edges: { node: { id: true, pointOfContactId: true } },
      },
    }),
  );

  const nodes: OpportunityNode[] = (opportunities?.edges ?? [])
    .map((edge: { node: OpportunityNode }) => edge.node)
    .filter((node: OpportunityNode) => Boolean(node.id));

  if (nodes.length === 0) {
    return { batchId, count: 0 };
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

  return { batchId, count: nodes.length };
};

export default defineLogicFunction({
  universalIdentifier:
    BACKFILL_OPPORTUNITIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-opportunities-last-contact',
  description:
    'Backfills last-contact fields for one batch of opportunities from their point of contact, resolved from the batch id in its payload.',
  timeoutSeconds: 120,
  handler,
});
