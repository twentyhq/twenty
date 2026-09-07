import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection, kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import { FATHOM_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomConnectionHookPayload } from 'src/logic-functions/types/fathom-connection-hook-payload.type';
import { type FathomWebhookRegistration } from 'src/logic-functions/types/fathom-webhook-registration.type';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { deleteStaleFathomWebhook } from 'src/logic-functions/utils/delete-stale-fathom-webhook.util';
import { getFathomConnectionClaimKey } from 'src/logic-functions/utils/get-fathom-connection-claim-key.util';
import { getFathomWebhookRegistrationKey } from 'src/logic-functions/utils/get-fathom-webhook-registration-key.util';

export const fathomDisconnectHandler = async (
  payload: FathomConnectionHookPayload,
): Promise<{ success: true }> => {
  const registrationKey = getFathomWebhookRegistrationKey(
    payload.connectedAccountId,
  );
  const registration = await kv.get<FathomWebhookRegistration>(registrationKey);

  if (!isDefined(registration)) {
    await kv.delete(getFathomConnectionClaimKey(payload.connectedAccountId), {
      scope: 'SERVER',
    });

    return { success: true };
  }

  await kv.set(registrationKey, { ...registration, isActive: false });

  const connection = await getConnection(payload.connectedAccountId);

  await deleteStaleFathomWebhook({
    fathomClient: createFathomClient(connection.accessToken),
    webhookId: registration.webhookId,
  });
  await kv.delete(registrationKey);
  await kv.delete(getFathomConnectionClaimKey(payload.connectedAccountId), {
    scope: 'SERVER',
  });

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_DISCONNECT_UNIVERSAL_IDENTIFIER,
  name: 'fathom-disconnect',
  description:
    'Deletes the registered Fathom webhook after a user removes their connection.',
  timeoutSeconds: 30,
  handler: fathomDisconnectHandler,
});
