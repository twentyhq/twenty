import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import {
  BACKFILL_BATCH_SIZE,
  BACKFILL_PEOPLE_ROUTE_PATH,
  BACKFILL_SLEEP_MS,
} from 'src/constants/backfill';
import { BACKFILL_PEOPLE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  buildPersonAggregates,
  buildPersonUpdateData,
} from 'src/utils/person-last-contact-aggregation';
import { postToOwnRoute, sleep } from 'src/utils/post-to-own-route';

type BackfillBody = { cursor?: string };

const handler = async (
  payload: RoutePayload<BackfillBody>,
): Promise<object> => {
  const client = new CoreApiClient();
  const cursor = payload.body?.cursor;

  const { people } = await executeWithRetry(() =>
    client.query({
      people: {
        __args: { first: BACKFILL_BATCH_SIZE, after: cursor },
        edges: { node: { id: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    }),
  );

  const personIds = (people?.edges ?? [])
    .map((edge: { node: { id: string } }) => edge.node.id)
    .filter(Boolean);

  if (personIds.length === 0) {
    return { outcome: 'done' };
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

  if (people?.pageInfo.hasNextPage && people.pageInfo.endCursor) {
    await sleep(BACKFILL_SLEEP_MS);
    await postToOwnRoute({
      path: BACKFILL_PEOPLE_ROUTE_PATH,
      body: { cursor: people.pageInfo.endCursor },
    });
  }

  return { outcome: 'processed', count: personIds.length };
};

export default defineLogicFunction({
  universalIdentifier: BACKFILL_PEOPLE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-people-last-contact',
  description:
    'Backfills last-contact fields for a page of people from their messages and calendar events, then re-triggers itself with the next cursor.',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: BACKFILL_PEOPLE_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
