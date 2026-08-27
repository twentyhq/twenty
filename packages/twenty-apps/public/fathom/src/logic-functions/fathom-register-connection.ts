import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection, kv } from 'twenty-sdk/logic-function';

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
  };

  await kv.set(registrationKey, registration);

  return { success: true, webhookId: webhook.id };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  name: 'fathom-register-connection',
  description:
    'Registers a Fathom webhook using the connected account\'s permissions.',
  timeoutSeconds: 30,
  handler: fathomRegisterConnectionHandler,
});
