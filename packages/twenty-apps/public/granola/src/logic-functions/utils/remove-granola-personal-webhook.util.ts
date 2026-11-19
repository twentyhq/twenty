import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type GranolaPersonalWebhookRegistration } from 'src/logic-functions/types/granola-personal-webhook-registration.type';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { deleteStaleGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/delete-stale-granola-webhook-endpoint-or-throw.util';
import { getGranolaPersonalRegistrationId } from 'src/logic-functions/utils/get-granola-personal-registration-id.util';
import { getGranolaPersonalWebhookKey } from 'src/logic-functions/utils/get-granola-personal-webhook-key.util';
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
      getGranolaPersonalRegistrationId(connectionId),
    ),
    { scope: 'SERVER' },
  );
  await kv.delete(key);

  if (!isDefined(webhook)) {
    return;
  }

  if (!isDefined(client)) {
    console.error(
      `[granola] Remove personal endpoint ${webhook.webhookEndpointId} in Granola settings. The API key is unavailable.`,
    );

    return;
  }

  try {
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
