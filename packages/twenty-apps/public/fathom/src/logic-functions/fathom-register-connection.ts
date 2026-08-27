import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJob, getConnection, kv } from 'twenty-sdk/logic-function';

import { FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/fathom-backfill-worker-universal-identifier';
import { FATHOM_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER } from 'src/constants/fathom-register-connection-universal-identifier';
import { type FathomConnectionHookPayload } from 'src/logic-functions/types/fathom-connection-hook-payload.type';
import { type FathomWebhookRegistration } from 'src/logic-functions/types/fathom-webhook-registration.type';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { getFathomWebhookDestinationUrl } from 'src/logic-functions/utils/get-fathom-webhook-destination-url.util';
import { getFathomWebhookRegistrationKey } from 'src/logic-functions/utils/get-fathom-webhook-registration-key.util';

export const fathomRegisterConnectionHandler = async (
  payload: FathomConnectionHookPayload,
): Promise<{ success: true; webhookId: string }> => {
  if (!isNonEmptyString(payload.connectedAccountId)) {
    throw new Error(
      'Fathom connection registration requires a connectedAccountId',
    );
  }

  const functionsUrl = process.env.TWENTY_FUNCTIONS_URL;

  if (!isNonEmptyString(functionsUrl)) {
    throw new Error(
      'TWENTY_FUNCTIONS_URL is required to register a Fathom webhook',
    );
  }

  const connection = await getConnection(payload.connectedAccountId);
  const fathomClient = createFathomClient(connection.accessToken);
  const registrationKey = getFathomWebhookRegistrationKey(
    payload.connectedAccountId,
  );
  const existingRegistration = await kv.get<FathomWebhookRegistration>(
    registrationKey,
  );

  if (existingRegistration?.isActive) {
    if (!existingRegistration.isInitialBackfillEnqueued) {
      await enqueueInitialBackfill(payload.connectedAccountId);
      await kv.set(registrationKey, {
        ...existingRegistration,
        isInitialBackfillEnqueued: true,
      });
    }

    return { success: true, webhookId: existingRegistration.webhookId };
  }

  if (existingRegistration) {
    try {
      await fathomClient.deleteWebhook({ id: existingRegistration.webhookId });
    } catch {
      // A disconnected webhook may already have been removed in Fathom.
    }
  }

  const webhook = await fathomClient.createWebhook({
    destinationUrl: getFathomWebhookDestinationUrl({
      functionsUrl,
      connectedAccountId: payload.connectedAccountId,
    }),
    triggeredFor: [
      'my_recordings',
      'my_shared_with_team_recordings',
      'shared_team_recordings',
    ],
    includeTranscript: true,
    includeSummary: true,
    includeActionItems: true,
  });
  const registration: FathomWebhookRegistration = {
    webhookId: webhook.id,
    secret: webhook.secret,
    isActive: true,
    isInitialBackfillEnqueued: false,
  };

  await kv.set(registrationKey, registration);

  await enqueueInitialBackfill(payload.connectedAccountId);
  await kv.set(registrationKey, {
    ...registration,
    isInitialBackfillEnqueued: true,
  });

  return { success: true, webhookId: webhook.id };
};

const enqueueInitialBackfill = async (
  connectedAccountId: string,
): Promise<void> => {
  const enqueueResult = await enqueueJob({
    logicFunctionUniversalIdentifier:
      FATHOM_BACKFILL_WORKER_UNIVERSAL_IDENTIFIER,
    payload: { connectedAccountId, days: 7 },
    retryLimit: 3,
  });

  if (!enqueueResult.enqueued) {
    throw new Error('Failed to enqueue the initial Fathom backfill');
  }
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  name: 'fathom-register-connection',
  description:
    'Registers a Fathom webhook using the connected account\'s permissions.',
  timeoutSeconds: 30,
  handler: fathomRegisterConnectionHandler,
});
