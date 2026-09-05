import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import {
  FATHOM_DISCONNECT_UNIVERSAL_IDENTIFIER,
  FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type FathomConnectionHookPayload } from 'src/logic-functions/types/fathom-connection-hook-payload.type';
import { type FathomWebhookRegistration } from 'src/logic-functions/types/fathom-webhook-registration.type';
import { enqueueFathomJobsOrThrow } from 'src/logic-functions/utils/enqueue-fathom-jobs-or-throw.util';
import { getFathomWebhookRegistrationKey } from 'src/logic-functions/utils/get-fathom-webhook-registration-key.util';

export const fathomDisconnectHandler = async (
  payload: FathomConnectionHookPayload,
): Promise<{ success: true }> => {
  const registrationKey = getFathomWebhookRegistrationKey(
    payload.connectedAccountId,
  );
  const registration = await kv.get<FathomWebhookRegistration>(registrationKey);

  if (isDefined(registration)) {
    await kv.set(registrationKey, { ...registration, isActive: false });
  }

  await enqueueFathomJobsOrThrow({
    logicFunctionUniversalIdentifier:
      FATHOM_RECONCILE_MEDIA_IMPORTS_UNIVERSAL_IDENTIFIER,
    payloads: [{ disconnectedAccountId: payload.connectedAccountId }],
  });

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_DISCONNECT_UNIVERSAL_IDENTIFIER,
  name: 'fathom-disconnect',
  description:
    'Disables webhook ingestion and schedules media cleanup after a user removes their Fathom connection.',
  timeoutSeconds: 30,
  handler: fathomDisconnectHandler,
});
