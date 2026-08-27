import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import { FATHOM_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fathom-disconnect-universal-identifier';
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

  if (registration) {
    // Twenty runs onDisconnect after deleting the token, so retain the secret only
    // to authenticate and acknowledge any Fathom deliveries still in flight.
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
