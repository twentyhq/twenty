import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  kv,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import { FATHOM_INITIAL_BACKFILL_DAYS } from 'src/constants/fathom.constant';
import { FATHOM_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomConnectionHookPayload } from 'src/logic-functions/types/fathom-connection-hook-payload.type';
import { type FathomWebhookRegistration } from 'src/logic-functions/types/fathom-webhook-registration.type';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { deleteStaleFathomWebhook } from 'src/logic-functions/utils/delete-stale-fathom-webhook.util';
import { enqueueFathomBackfillWorker } from 'src/logic-functions/utils/enqueue-fathom-backfill-worker.util';
import { getFathomConnectionClaimKey } from 'src/logic-functions/utils/get-fathom-connection-claim-key.util';
import { getFathomWebhookDestinationUrl } from 'src/logic-functions/utils/get-fathom-webhook-destination-url.util';
import { getFathomWebhookRegistrationKey } from 'src/logic-functions/utils/get-fathom-webhook-registration-key.util';
import { isTransientFathomError } from 'src/logic-functions/utils/is-transient-fathom-error.util';
import { storeFathomWebhookRegistration } from 'src/logic-functions/utils/store-fathom-webhook-registration.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

// The hook retries as a whole, so the flag keeps a retry after a failed enqueue
// from skipping the import behind the already active registration.
const enqueueInitialBackfillOnce = async ({
  connectedAccountId,
  registrationKey,
  registration,
}: {
  connectedAccountId: string;
  registrationKey: string;
  registration: FathomWebhookRegistration;
}): Promise<void> => {
  if (registration.isInitialBackfillEnqueued) {
    return;
  }

  await enqueueFathomBackfillWorker({
    connectedAccountId,
    days: FATHOM_INITIAL_BACKFILL_DAYS,
  });
  await kv.set(registrationKey, {
    ...registration,
    isInitialBackfillEnqueued: true,
  });
};

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
    await enqueueInitialBackfillOnce({
      connectedAccountId: payload.connectedAccountId,
      registrationKey,
      registration: existingRegistration,
    });

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

  const registration: FathomWebhookRegistration = {
    webhookId: webhook.id,
    secret: webhook.secret,
    isActive: true,
    isInitialBackfillEnqueued: false,
  };

  await storeFathomWebhookRegistration({
    fathomClient,
    connectedAccountId: payload.connectedAccountId,
    registrationKey,
    registration,
  });
  await enqueueInitialBackfillOnce({
    connectedAccountId: payload.connectedAccountId,
    registrationKey,
    registration,
  });

  return { success: true, webhookId: webhook.id };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  name: 'fathom-register-connection',
  description:
    "Registers a Fathom webhook using the connected account's permissions and starts the initial history import.",
  timeoutSeconds: 30,
  handler: fathomRegisterConnectionHandler,
});
