import { defineUninstallLogicFunction } from 'twenty-sdk/define';
import {
  type AppConnection,
  kv,
  listConnections,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import { FATHOM_PROVIDER_NAME } from 'src/constants/fathom.constant';
import { FATHOM_UNINSTALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomWebhookRegistration } from 'src/logic-functions/types/fathom-webhook-registration.type';
import { getFathomConnectionClaimKey } from 'src/logic-functions/utils/get-fathom-connection-claim-key.util';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { getFathomWebhookRegistrationKey } from 'src/logic-functions/utils/get-fathom-webhook-registration-key.util';
import { isFathomNotFoundError } from 'src/logic-functions/utils/is-fathom-not-found-error.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const deleteWebhookForConnection = async (
  connection: AppConnection,
): Promise<boolean> => {
  const registrationKey = getFathomWebhookRegistrationKey(connection.id);
  const registration = await kv.get<FathomWebhookRegistration>(registrationKey);

  if (!isDefined(registration)) {
    return false;
  }

  let isWebhookGone = false;

  try {
    await createFathomClient(connection.accessToken).deleteWebhook({
      id: registration.webhookId,
    });
    isWebhookGone = true;
  } catch (error) {
    isWebhookGone = isFathomNotFoundError(error);

    if (!isWebhookGone) {
      // Uninstall runs once and takes the app's KV with it, so this log line is
      // the only record of the webhook left behind in Fathom.
      console.error(
        `[fathom] leaked webhook ${registration.webhookId} for connected account ${connection.id}: ${toErrorMessage(error)}`,
      );
    }
  }

  await kv.delete(registrationKey);
  await kv.delete(getFathomConnectionClaimKey(connection.id), {
    scope: 'SERVER',
  });

  return isWebhookGone;
};

export const fathomUninstallHandler = async (): Promise<{
  deletedWebhookCount: number;
}> => {
  const connections = await listConnections({
    providerName: FATHOM_PROVIDER_NAME,
  });
  let deletedWebhookCount = 0;

  for (const connection of connections) {
    try {
      if (await deleteWebhookForConnection(connection)) {
        deletedWebhookCount++;
      }
    } catch (error) {
      console.error(
        `[fathom] webhook cleanup failed for connected account ${connection.id}: ${toErrorMessage(error)}`,
      );
    }
  }

  return { deletedWebhookCount };
};

export default defineUninstallLogicFunction({
  universalIdentifier: FATHOM_UNINSTALL_UNIVERSAL_IDENTIFIER,
  name: 'fathom-uninstall',
  description:
    'Deletes the Fathom webhooks registered for every connected account when the app is uninstalled.',
  timeoutSeconds: 30,
  handler: fathomUninstallHandler,
});
