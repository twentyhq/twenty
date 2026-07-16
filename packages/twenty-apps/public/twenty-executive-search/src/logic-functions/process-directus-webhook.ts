import { randomUUID } from 'crypto';

import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { PROCESS_DIRECTUS_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/process-directus-webhook-logic-function-universal-identifier';
import { type DirectusWebhookEnvelope } from 'src/logic-functions/receive-directus-webhook';

type ProcessDirectusWebhookPayload = {
  workspaceId: string;
  targetLogicFunctionUniversalIdentifier: string;
  payload: DirectusWebhookEnvelope;
  headers: Record<string, string | undefined>;
};

// Dispatched by the receive-directus-webhook resolver; runs in the resolved workspace.
export const processDirectusWebhookHandler = async (
  inboundPayload: ProcessDirectusWebhookPayload,
): Promise<object> => {
  const client = new CoreApiClient();
  const { payload } = inboundPayload;

  const eventId =
    payload.id !== undefined ? String(payload.id) : randomUUID();
  const idempotencyKey = `${payload.collection ?? 'unknown'}:${eventId}`;
  const sourceCollection = payload.collection ?? 'unknown';
  const sourceRecordId = eventId;
  const workspaceKey = inboundPayload.workspaceId;

  const result = await client.mutation({
    createExternalSyncInboundEvent: {
      __args: {
        data: {
          eventId,
          idempotencyKey,
          sourceSystem: 'DIRECTUS',
          sourceCollection,
          sourceRecordId,
          workspaceKey,
          rawEnvelope: JSON.stringify(payload),
          status: 'RECEIVED',
        },
      },
      id: true,
    },
  });

  return {
    inboundEventId: result.createExternalSyncInboundEvent?.id,
    eventId,
    sourceCollection,
    sourceRecordId,
  };
};

export default defineLogicFunction({
  universalIdentifier:
    PROCESS_DIRECTUS_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'process-directus-webhook',
  description:
    'Persists verified Directus webhook events to the inbound sync event ledger for downstream processing.',
  timeoutSeconds: 30,
  handler: processDirectusWebhookHandler,
});
