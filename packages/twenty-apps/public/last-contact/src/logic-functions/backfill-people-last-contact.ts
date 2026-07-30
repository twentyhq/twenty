import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import {
  type BackfillBatchResult,
  BACKFILL_PEOPLE_ROUTE_PATH,
} from 'src/constants/backfill';
import { BACKFILL_PEOPLE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getBackfillBatchSize } from 'src/utils/backfill-settings';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  buildPersonAggregates,
  buildPersonUpdateData,
} from 'src/utils/person-last-contact-aggregation';

type BackfillBody = { cursor?: string };

const handler = async (
  payload: RoutePayload<BackfillBody>,
): Promise<BackfillBatchResult> => {
  const client = new CoreApiClient();
  const cursor = payload.body?.cursor;

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
    return { nextCursor: null, count: 0 };
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

  return { nextCursor, count: personIds.length };
};

export default defineLogicFunction({
  universalIdentifier: BACKFILL_PEOPLE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-people-last-contact',
  description:
    'Backfills last-contact fields for one page of people from their messages and calendar events, returning the next cursor to the backfill orchestrator.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: BACKFILL_PEOPLE_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
