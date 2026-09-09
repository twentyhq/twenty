import { defineUninstallLogicFunction } from 'twenty-sdk/define';

import { GRANOLA_UNINSTALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { cleanupPendingGranolaRegistrationOrThrow } from 'src/logic-functions/utils/cleanup-pending-granola-registration-or-throw.util';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { removeGranolaWebhookRegistration } from 'src/logic-functions/utils/remove-granola-webhook-registration.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const granolaUninstallHandler = async () => {
  const client = createGranolaClientOrThrow();
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

  return removeGranolaWebhookRegistration({ client });
};

export default defineUninstallLogicFunction({
  universalIdentifier: GRANOLA_UNINSTALL_UNIVERSAL_IDENTIFIER,
  name: 'granola-uninstall',
  description: 'Removes the registered Granola webhook on uninstall.',
  timeoutSeconds: 30,
  handler: granolaUninstallHandler,
});
