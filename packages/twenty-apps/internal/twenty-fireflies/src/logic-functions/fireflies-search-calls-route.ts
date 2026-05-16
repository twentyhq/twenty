import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { FIREFLIES_SEARCH_CALLS_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { firefliesSearchCallsHandler } from 'src/logic-functions/handlers/fireflies-search-calls-handler';

const parsePositiveInteger = (value: unknown): number | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const handler = async (event: RoutePayload) => {
  const params = event.queryStringParameters ?? {};
  const rawKeyword = params.keyword;

  if (typeof rawKeyword !== 'string') {
    return {
      success: false,
      message: 'Failed to search Fireflies calls',
      error: '`keyword` query parameter is required.',
    };
  }

  const keyword = rawKeyword.trim();

  if (!isNonEmptyString(keyword)) {
    return {
      success: false,
      message: 'Failed to search Fireflies calls',
      error: '`keyword` query parameter is required.',
    };
  }

  return firefliesSearchCallsHandler({
    keyword,
    limit: parsePositiveInteger(params.limit),
  });
};

export default defineLogicFunction({
  universalIdentifier: FIREFLIES_SEARCH_CALLS_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-search-calls-route',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/fireflies/calls/search',
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
