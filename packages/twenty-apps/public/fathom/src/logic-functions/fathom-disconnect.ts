import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import { FATHOM_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomConnectionHookPayload } from 'src/logic-functions/types/fathom-connection-hook-payload.type';
import { type FathomWebhookRegistration } from 'src/logic-functions/types/fathom-webhook-registration.type';
import { getFathomWebhookRegistrationKey } from 'src/logic-functions/utils/get-fathom-webhook-registration-key.util';

export const fathomDisconnectHandler = async (
  payload: FathomConnectionHookPayload,
): Promise<{ success: true }> => {
  const registrationKey = getFathomWebhookRegistrationKey(
    payload.connectedAccountId,
  );
  const registration = await kv.get<FathomWebhookRegistration>(registrationKey);

  if (isDefined(registration)) {
    // Twenty runs onDisconnect after deleting the token, so the secret is kept only
    // to acknowledge Fathom deliveries still in flight.
    // TODO: delete the webhook, this registration and the server-scoped connection
    // claim here, and drop isActive, once the engine carries #25215.
    await kv.set(registrationKey, { ...registration, isActive: false });
  }

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_DISCONNECT_UNIVERSAL_IDENTIFIER,
  name: 'fathom-disconnect',
  description:
    'Disables webhook ingestion after a user removes their Fathom connection.',
  timeoutSeconds: 10,
  handler: fathomDisconnectHandler,
});
