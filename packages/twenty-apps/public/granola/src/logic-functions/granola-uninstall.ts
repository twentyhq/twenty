import { defineUninstallLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_WEBHOOK_REGISTRATION_KEY } from 'src/constants/granola.constant';
import { GRANOLA_UNINSTALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type GranolaWebhookRegistration } from 'src/logic-functions/types/granola-webhook-registration.type';
import { cleanupPendingGranolaRegistrationOrThrow } from 'src/logic-functions/utils/cleanup-pending-granola-registration-or-throw.util';
import { cleanupStaleGranolaRegistrationsOrThrow } from 'src/logic-functions/utils/cleanup-stale-granola-registrations-or-throw.util';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { deleteStaleGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/delete-stale-granola-webhook-endpoint-or-throw.util';
import { getGranolaRegistrationClaimKey } from 'src/logic-functions/utils/get-granola-registration-claim-key.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const granolaUninstallHandler = async () => {
  const client = createGranolaClientOrThrow();
  try {
    await cleanupStaleGranolaRegistrationsOrThrow({ client });
  } catch (error) {
    console.error(
      `[granola] Could not clean up previous registrations during uninstall; check Granola webhook settings. ${toErrorMessage(error)}`,
    );
  }
  try {
    const { webhook_endpoints: endpoints } =
      await client.listWebhookEndpoints();
    await cleanupPendingGranolaRegistrationOrThrow({
      client,
      endpoints,
      apiUrl: process.env.TWENTY_API_URL,
    });
  } catch (error) {
    console.error(
      `[granola] Could not clean up the pending registration during uninstall; check Granola webhook settings. ${toErrorMessage(error)}`,
    );
  }
  const registration = await kv.get<GranolaWebhookRegistration>(
    GRANOLA_WEBHOOK_REGISTRATION_KEY,
  );
  if (!isDefined(registration)) {
    return { deletedWebhookCount: 0 };
  }
  let deletedWebhookCount = 0;
  try {
    await deleteStaleGranolaWebhookEndpointOrThrow({
      client,
      webhookEndpointId: registration.webhookEndpointId,
    });
    deletedWebhookCount = 1;
  } catch (error) {
    console.error(
      `[granola] Could not remove endpoint ${registration.webhookEndpointId} during uninstall; remove it in Granola settings. ${toErrorMessage(error)}`,
    );
  }
  await kv.delete(getGranolaRegistrationClaimKey(registration.registrationId), {
    scope: 'SERVER',
  });
  await kv.delete(GRANOLA_WEBHOOK_REGISTRATION_KEY);
  return { deletedWebhookCount };
};

export default defineUninstallLogicFunction({
  universalIdentifier: GRANOLA_UNINSTALL_UNIVERSAL_IDENTIFIER,
  name: 'granola-uninstall',
  description: 'Removes the registered Granola webhook on uninstall.',
  timeoutSeconds: 30,
  handler: granolaUninstallHandler,
});
