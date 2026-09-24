import { type Fathom } from 'fathom-typescript';
import { kv } from 'twenty-sdk/logic-function';

import { type FathomWebhookRegistration } from 'src/logic-functions/types/fathom-webhook-registration.type';
import { deleteStaleFathomWebhook } from 'src/logic-functions/utils/delete-stale-fathom-webhook.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const storeFathomWebhookRegistration = async ({
  fathomClient,
  connectedAccountId,
  registrationKey,
  registration,
}: {
  fathomClient: Fathom;
  connectedAccountId: string;
  registrationKey: string;
  registration: FathomWebhookRegistration;
}): Promise<void> => {
  try {
    await kv.set(registrationKey, registration);
  } catch (error) {
    // A write whose response was lost may still have committed.
    const storedRegistration = await kv
      .get<FathomWebhookRegistration>(registrationKey)
      .catch(() => null);

    if (storedRegistration?.webhookId === registration.webhookId) {
      return;
    }

    // Fathom has no webhook listing endpoint, so a webhook this app never
    // recorded can never be found again: undo it before the retry creates
    // a second one against the same destination.
    try {
      await deleteStaleFathomWebhook({
        fathomClient,
        webhookId: registration.webhookId,
      });
    } catch (deleteError) {
      console.error(
        `[fathom] leaked webhook ${registration.webhookId} for connected account ${connectedAccountId}: ${toErrorMessage(deleteError)}`,
      );
    }

    throw error;
  }
};
