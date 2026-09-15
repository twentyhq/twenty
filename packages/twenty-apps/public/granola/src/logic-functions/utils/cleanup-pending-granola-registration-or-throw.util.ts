import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_PENDING_REGISTRATION_KEY } from 'src/constants/granola.constant';
import { type GranolaWebhookEndpoint } from 'src/logic-functions/types/granola-api.type';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { deleteStaleGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/delete-stale-granola-webhook-endpoint-or-throw.util';
import { getGranolaRegistrationClaimKey } from 'src/logic-functions/utils/get-granola-registration-claim-key.util';
import { getGranolaWebhookDestinationUrlOrThrow } from 'src/logic-functions/utils/get-granola-webhook-destination-url-or-throw.util';

export const cleanupPendingGranolaRegistrationOrThrow = async ({
  client,
  endpoints,
  apiUrl,
}: {
  client: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    'deleteWebhookEndpoint'
  >;
  endpoints: Pick<GranolaWebhookEndpoint, 'id' | 'url'>[];
  apiUrl: string | undefined;
}): Promise<void> => {
  const pendingId = await kv.get<string>(GRANOLA_PENDING_REGISTRATION_KEY);

  if (!isNonEmptyString(pendingId)) {
    return;
  }

  if (isDefined(apiUrl)) {
    const pendingUrl = getGranolaWebhookDestinationUrlOrThrow({
      apiUrl,
      registrationId: pendingId,
    });

    for (const orphan of endpoints.filter(
      (candidate) => candidate.url === pendingUrl,
    )) {
      await deleteStaleGranolaWebhookEndpointOrThrow({
        client,
        webhookEndpointId: orphan.id,
      });
    }
  }

  await kv.delete(getGranolaRegistrationClaimKey(pendingId), {
    scope: 'SERVER',
  });
  await kv.delete(GRANOLA_PENDING_REGISTRATION_KEY);
};
