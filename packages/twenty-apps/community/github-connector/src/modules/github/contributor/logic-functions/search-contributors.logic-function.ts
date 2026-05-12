import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';
import {
  searchContributors,
  type ContributorSearchResult,
} from 'src/modules/github/contributor/graphql/queries/search-contributors';

type SearchContributorsPayload = {
  query?: string;
  limit?: number;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const handler = async (
  event: RoutePayload<SearchContributorsPayload>,
): Promise<{ contributors: ContributorSearchResult[] }> => {
  const queryInput = event.body?.query;
  const rawQuery = typeof queryInput === 'string' ? queryInput.trim() : '';
  const limitInput = event.body?.limit;
  const limitNumber =
    typeof limitInput === 'number' && Number.isFinite(limitInput)
      ? limitInput
      : DEFAULT_LIMIT;
  const limit = Math.min(Math.max(Math.floor(limitNumber), 1), MAX_LIMIT);

  const contributors = await searchContributors(rawQuery, limit);
  return { contributors };
};

export default defineLogicFunction({
  universalIdentifier: 'b4d8f2a7-3e58-4f9b-ac1d-8f7e2b3c4d5e',
  name: 'search-contributors',
  description:
    'Searches contributors by name or GitHub login for use in front-end pickers.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/contributors/search',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
