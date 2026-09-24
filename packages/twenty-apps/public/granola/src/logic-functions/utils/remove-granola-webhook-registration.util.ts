import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  GRANOLA_PENDING_FOLDER_SELECTION_KEY,
  GRANOLA_WEBHOOK_REGISTRATION_KEY,
} from 'src/constants/granola.constant';
import { type GranolaWebhookRegistration } from 'src/logic-functions/types/granola-webhook-registration.type';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { deleteStaleGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/delete-stale-granola-webhook-endpoint-or-throw.util';
import { getGranolaRegistrationClaimKey } from 'src/logic-functions/utils/get-granola-registration-claim-key.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const removeGranolaWebhookRegistration = async ({
  client,
}: {
  client: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    'deleteWebhookEndpoint'
  >;
}): Promise<{ deletedWebhookCount: number }> => {
  const registration = await kv.get<GranolaWebhookRegistration>(
    GRANOLA_WEBHOOK_REGISTRATION_KEY,
  );

  await kv.delete(GRANOLA_PENDING_FOLDER_SELECTION_KEY);

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
      `[granola] Could not remove endpoint ${registration.webhookEndpointId}; remove it in Granola settings. ${toErrorMessage(error)}`,
    );
  }

  await kv.delete(getGranolaRegistrationClaimKey(registration.registrationId), {
    scope: 'SERVER',
  });
  await kv.delete(GRANOLA_WEBHOOK_REGISTRATION_KEY);

  return { deletedWebhookCount };
};
