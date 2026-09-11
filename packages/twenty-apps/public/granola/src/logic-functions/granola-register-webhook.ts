import { defineLogicFunction } from 'twenty-sdk/define';

import { GRANOLA_WEBHOOK_REGISTRATION_ROUTE_PATH } from 'src/constants/granola-webhook-registration-route-path';
import { GRANOLA_REGISTER_WEBHOOK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { currentUserCanManageGranolaOrThrow } from 'src/logic-functions/utils/current-user-can-manage-granola-or-throw.util';
import { enqueueGranolaInitialBackfillOrThrow } from 'src/logic-functions/utils/enqueue-granola-initial-backfill-or-throw.util';
import { ensureGranolaWebhookRegistrationOrThrow } from 'src/logic-functions/utils/ensure-granola-webhook-registration-or-throw.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const granolaRegisterWebhookHandler = async () => {
  if (!(await currentUserCanManageGranolaOrThrow())) {
    return {
      success: false,
      error: 'Application management permission is required.',
    };
  }
  try {
    const registration = await ensureGranolaWebhookRegistrationOrThrow();
    try {
      await enqueueGranolaInitialBackfillOrThrow(registration);
    } catch (error) {
      console.error(
        `[granola] Could not queue the initial import for registration ${registration.registrationId}; the daily catch-up will retry. ${toErrorMessage(error)}`,
      );
    }
    return { success: true };
  } catch (error) {
    if (error instanceof GranolaApiError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_REGISTER_WEBHOOK_UNIVERSAL_IDENTIFIER,
  name: 'granola-register-webhook',
  description:
    'Registers the Granola webhook for the saved key and starts the initial history import.',
  timeoutSeconds: 60,
  handler: granolaRegisterWebhookHandler,
  httpRouteTriggerSettings: {
    path: GRANOLA_WEBHOOK_REGISTRATION_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
