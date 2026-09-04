import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  kv,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import { FATHOM_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomConnectionHookPayload } from 'src/logic-functions/types/fathom-connection-hook-payload.type';
import { type FathomWebhookRegistration } from 'src/logic-functions/types/fathom-webhook-registration.type';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { deleteStaleFathomWebhook } from 'src/logic-functions/utils/delete-stale-fathom-webhook.util';
import { getFathomConnectionClaimKey } from 'src/logic-functions/utils/get-fathom-connection-claim-key.util';
import { getFathomWebhookDestinationUrl } from 'src/logic-functions/utils/get-fathom-webhook-destination-url.util';
import { getFathomWebhookRegistrationKey } from 'src/logic-functions/utils/get-fathom-webhook-registration-key.util';
import { isTransientFathomError } from 'src/logic-functions/utils/is-transient-fathom-error.util';
import { storeFathomWebhookRegistration } from 'src/logic-functions/utils/store-fathom-webhook-registration.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const fathomRegisterConnectionHandler = async (
  payload: FathomConnectionHookPayload,
): Promise<{ success: true; webhookId: string }> => {
  if (!isNonEmptyString(payload.connectedAccountId)) {
    throw new Error(
      'Fathom connection registration requires a connectedAccountId',
    );
  }

  const apiUrl = process.env.TWENTY_API_URL;

  if (!isNonEmptyString(apiUrl)) {
    throw new Error('TWENTY_API_URL is required to register a Fathom webhook');
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

  if (isDefined(existingRegistration)) {
    await deleteStaleFathomWebhook({
      fathomClient,
      webhookId: existingRegistration.webhookId,
    });
  }

  await kv.set(getFathomConnectionClaimKey(payload.connectedAccountId), null, {
    scope: 'SERVER',
  });

  const webhook = await fathomClient
    .createWebhook({
      destinationUrl: getFathomWebhookDestinationUrl({
        apiUrl,
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
    })
    .catch((error: unknown) => {
      if (isTransientFathomError(error)) {
        throw new RetryableLogicFunctionError(toErrorMessage(error));
      }

      throw error;
    });

  await storeFathomWebhookRegistration({
    fathomClient,
    connectedAccountId: payload.connectedAccountId,
    registrationKey,
    registration: {
      webhookId: webhook.id,
      secret: webhook.secret,
      isActive: true,
    },
  });

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
