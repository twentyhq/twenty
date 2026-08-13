import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { type BackfillBatchPayload } from 'src/constants/backfill';
import { BACKFILL_PEOPLE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildBackfillBatchArgs } from 'src/utils/backfill-batch-args';
import { getBackfillBatchSize } from 'src/utils/backfill-settings';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  buildPersonAggregates,
  buildPersonUpdateData,
} from 'src/utils/person-last-contact-aggregation';

const handler = async ({ batchId }: BackfillBatchPayload): Promise<object> => {
  const client = new CoreApiClient();

  const { people } = await executeWithRetry(() =>
    client.query({
      people: {
        __args: buildBackfillBatchArgs(batchId, getBackfillBatchSize()),
        edges: { node: { id: true } },
      },
    }),
  );

  const personIds = (people?.edges ?? [])
    .map((edge: { node: { id: string } }) => edge.node.id)
    .filter(Boolean);

  if (personIds.length === 0) {
    return { batchId, count: 0 };
  }

  const aggByPersonId = await buildPersonAggregates(client, personIds);

  for (const personId of personIds) {
    const agg = aggByPersonId.get(personId);
    const data = buildPersonUpdateData(agg);

    await executeWithRetry(() =>
      client.mutation({
        updatePerson: { __args: { id: personId, data }, id: true },
      }),
    );
  }

  return { batchId, count: personIds.length };
};

export default defineLogicFunction({
  universalIdentifier: BACKFILL_PEOPLE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-people-last-contact',
  description:
    'Backfills last-contact fields for one batch of people, resolved from the batch id in its payload.',
  timeoutSeconds: 120,
  handler,
});
