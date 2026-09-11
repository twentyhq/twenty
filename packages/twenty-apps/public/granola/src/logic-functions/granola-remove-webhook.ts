import { defineLogicFunction } from 'twenty-sdk/define';

import { GRANOLA_WEBHOOK_REMOVAL_ROUTE_PATH } from 'src/constants/granola-webhook-removal-route-path';
import { GRANOLA_REMOVE_WEBHOOK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { currentUserCanManageGranolaOrThrow } from 'src/logic-functions/utils/current-user-can-manage-granola-or-throw.util';
import { removeGranolaWebhookRegistration } from 'src/logic-functions/utils/remove-granola-webhook-registration.util';

export const granolaRemoveWebhookHandler = async () => {
  if (!(await currentUserCanManageGranolaOrThrow())) {
    return {
      success: false,
      error: 'Application management permission is required.',
    };
  }

  const { deletedWebhookCount } = await removeGranolaWebhookRegistration({
    client: createGranolaClientOrThrow(),
  });

  return { success: true, deletedWebhookCount };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_REMOVE_WEBHOOK_UNIVERSAL_IDENTIFIER,
  name: 'granola-remove-webhook',
  description: 'Removes the registered Granola webhook for the saved key.',
  timeoutSeconds: 60,
  handler: granolaRemoveWebhookHandler,
  httpRouteTriggerSettings: {
    path: GRANOLA_WEBHOOK_REMOVAL_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
