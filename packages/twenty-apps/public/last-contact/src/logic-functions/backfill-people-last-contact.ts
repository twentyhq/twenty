import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import {
  type BackfillState,
  BACKFILL_STATE_KV_KEY,
} from 'src/constants/backfill';
import { BACKFILL_PEOPLE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { advanceBackfill } from 'src/utils/advance-backfill';
import { getBackfillBatchSize } from 'src/utils/backfill-settings';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  buildPersonAggregates,
  buildPersonUpdateData,
} from 'src/utils/person-last-contact-aggregation';

const PHASE = 'people';

const handler = async (): Promise<object> => {
  const state = await kv.get<BackfillState>(BACKFILL_STATE_KV_KEY);

  if (!state || state.phase !== PHASE) {
    return { outcome: 'skipped', phase: state?.phase ?? null };
  }

  const client = new CoreApiClient();
  const cursor = state.cursor ?? undefined;

  const { people } = await executeWithRetry(() =>
    client.query({
      people: {
        __args: { first: getBackfillBatchSize(), after: cursor },
        edges: { node: { id: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    }),
  );

  const personIds = (people?.edges ?? [])
    .map((edge: { node: { id: string } }) => edge.node.id)
    .filter(Boolean);

  if (personIds.length === 0) {
    return advanceBackfill({
      phase: PHASE,
      nextCursor: null,
      iterations: state.iterations,
    });
  }

  const aggByPersonId = await buildPersonAggregates(client, personIds);

  for (const personId of personIds) {
    const agg = aggByPersonId.get(personId);
    const data = agg ? buildPersonUpdateData(agg) : {};

    if (Object.keys(data).length === 0) {
      continue;
    }

    await executeWithRetry(() =>
      client.mutation({
        updatePerson: { __args: { id: personId, data }, id: true },
      }),
    );
  }

  const nextCursor =
    people?.pageInfo.hasNextPage && people.pageInfo.endCursor
      ? people.pageInfo.endCursor
      : null;

  return advanceBackfill({
    phase: PHASE,
    nextCursor,
    iterations: state.iterations,
  });
};

export default defineLogicFunction({
  universalIdentifier: BACKFILL_PEOPLE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-people-last-contact',
  description:
    'Backfills last-contact fields for one page of people from their messages and calendar events, then enqueues the next backfill batch.',
  timeoutSeconds: 120,
  handler,
});
