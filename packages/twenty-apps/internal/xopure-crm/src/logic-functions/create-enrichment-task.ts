import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

type EnrichmentTaskRequest = {
  targetType?: string;
  targetExternalId?: string;
  requestedDataPoints?: string[] | string;
};

const ALLOWED_TARGET_TYPES = new Set([
  'CUSTOMER',
  'AMBASSADOR',
  'RETAIL_PROSPECT',
  'INFLUENCER_PROSPECT',
]);

const handler = async (event: RoutePayload) => {
  const body = (event.body ?? {}) as EnrichmentTaskRequest;

  if (!body.targetType || !ALLOWED_TARGET_TYPES.has(body.targetType)) {
    return {
      statusCode: 400,
      body: {
        ok: false,
        error:
          'targetType must be CUSTOMER, AMBASSADOR, RETAIL_PROSPECT, or INFLUENCER_PROSPECT.',
      },
    };
  }

  if (!body.targetExternalId) {
    return {
      statusCode: 400,
      body: {
        ok: false,
        error: 'targetExternalId is required.',
      },
    };
  }

  return {
    ok: true,
    accepted: true,
    normalized: {
      targetType: body.targetType,
      targetExternalId: body.targetExternalId,
      requestedDataPoints: body.requestedDataPoints ?? [],
      provider: process.env.XOPURE_ENRICHMENT_PROVIDER ?? 'manual',
    },
    nextStep:
      'Wire normalized payload into xopureEnrichmentTask creation after the production API client is configured.',
  };
};

export default defineLogicFunction({
  universalIdentifier: '17289f7d-fb7b-4f4e-9ac5-886547a6d4a6',
  name: 'xopure-create-enrichment-task',
  description: 'Route stub for queueing research and contact enrichment work.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/xopure/enrichment/tasks',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
