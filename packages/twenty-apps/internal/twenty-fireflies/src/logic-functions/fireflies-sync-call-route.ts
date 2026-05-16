import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { FIREFLIES_SYNC_CALL_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { firefliesSyncCallHandler } from 'src/logic-functions/handlers/fireflies-sync-call-handler';

const handler = async (event: RoutePayload) => {
  const body = event.body as Record<string, unknown> | null;
  const rawTranscriptId = body?.transcriptId;

  if (typeof rawTranscriptId !== 'string') {
    return {
      success: false,
      message: 'Failed to sync Fireflies call',
      error: '`transcriptId` must be a string.',
    };
  }

  const transcriptId = rawTranscriptId.trim();

  if (!isNonEmptyString(transcriptId)) {
    return {
      success: false,
      message: 'Failed to sync Fireflies call',
      error: '`transcriptId` is required.',
    };
  }

  return firefliesSyncCallHandler({ transcriptId });
};

export default defineLogicFunction({
  universalIdentifier: FIREFLIES_SYNC_CALL_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-sync-call-route',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: '/fireflies/sync-call',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
