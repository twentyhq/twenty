import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type GranolaPersonalWebhookRegistration } from 'src/logic-functions/types/granola-personal-webhook-registration.type';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { deleteStaleGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/delete-stale-granola-webhook-endpoint-or-throw.util';
import {
  GRANOLA_PERSONAL_REGISTRATION_PREFIX,
  getGranolaPersonalWebhookKey,
} from 'src/logic-functions/utils/get-granola-personal-webhook-key.util';
import { getGranolaRegistrationClaimKey } from 'src/logic-functions/utils/get-granola-registration-claim-key.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const removeGranolaPersonalWebhook = async ({
  connectionId,
  client,
}: {
  connectionId: string;
  client?: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    'deleteWebhookEndpoint'
  >;
}) => {
  const key = getGranolaPersonalWebhookKey(connectionId);
  const webhook = await kv.get<GranolaPersonalWebhookRegistration>(key);

  await kv.delete(
    getGranolaRegistrationClaimKey(
      GRANOLA_PERSONAL_REGISTRATION_PREFIX + connectionId,
    ),
    { scope: 'SERVER' },
  );
  await kv.delete(key);

  if (!isDefined(webhook)) {
    return;
  }

  try {
    if (!isDefined(client)) {
      throw new Error('The Granola API key is unavailable.');
    }

    await deleteStaleGranolaWebhookEndpointOrThrow({
      client,
      webhookEndpointId: webhook.webhookEndpointId,
    });
  } catch (error) {
    console.error(
      `[granola] Remove personal endpoint ${webhook.webhookEndpointId} in Granola settings. ${toErrorMessage(error)}`,
    );
  }
};
