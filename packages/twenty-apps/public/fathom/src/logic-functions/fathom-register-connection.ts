import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection, kv } from 'twenty-sdk/logic-function';

import { FATHOM_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomConnectionHookPayload } from 'src/logic-functions/types/fathom-connection-hook-payload.type';
import { type FathomWebhookRegistration } from 'src/logic-functions/types/fathom-webhook-registration.type';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { getFathomWebhookDestinationUrl } from 'src/logic-functions/utils/get-fathom-webhook-destination-url.util';
import { getFathomWebhookRegistrationKey } from 'src/logic-functions/utils/get-fathom-webhook-registration-key.util';
import { isFathomNotFoundError } from 'src/logic-functions/utils/is-fathom-not-found-error.util';

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
  const existingRegistration =
    await kv.get<FathomWebhookRegistration>(registrationKey);

  if (existingRegistration?.isActive) {
    return { success: true, webhookId: existingRegistration.webhookId };
  }

  if (existingRegistration) {
    try {
      await fathomClient.deleteWebhook({ id: existingRegistration.webhookId });
    } catch (error) {
      // A webhook Fathom already dropped is the only failure safe to move past:
      // anything else would orphan the old webhook once it is replaced.
      if (!isFathomNotFoundError(error)) {
        throw error;
      }
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

  try {
    await kv.set(registrationKey, registration);
  } catch (error) {
    // A write whose response was lost may still have committed.
    const storedRegistration = await kv
      .get<FathomWebhookRegistration>(registrationKey)
      .catch(() => null);

    if (storedRegistration?.webhookId === webhook.id) {
      return { success: true, webhookId: webhook.id };
    }

    // Fathom has no webhook listing endpoint, so a webhook this app never
    // recorded can never be found again: undo it before the retry creates
    // a second one against the same destination.
    try {
      await fathomClient.deleteWebhook({ id: webhook.id });
    } catch {
      console.error(
        `[fathom] leaked webhook ${webhook.id} for connected account ${payload.connectedAccountId}`,
      );
    }

    throw error;
  }

  return { success: true, webhookId: webhook.id };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  name: 'fathom-register-connection',
  description:
    "Registers a Fathom webhook using the connected account's permissions.",
  timeoutSeconds: 30,
  handler: fathomRegisterConnectionHandler,
});
