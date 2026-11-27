import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { GRANOLA_PERSONAL_RECONCILE_TIMEOUT_SECONDS } from 'src/constants/granola-personal-connection.constant';
import { type GranolaPersonalWebhookRegistration } from 'src/logic-functions/types/granola-personal-webhook-registration.type';
import { GranolaWebhookConfigurationError } from 'src/logic-functions/types/granola-webhook-configuration-error';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { deleteStaleGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/delete-stale-granola-webhook-endpoint-or-throw.util';
import { getGranolaPersonalRegistrationId } from 'src/logic-functions/utils/get-granola-personal-registration-id.util';
import { getGranolaPersonalWebhookKey } from 'src/logic-functions/utils/get-granola-personal-webhook-key.util';
import { getGranolaWebhookDestinationUrlOrThrow } from 'src/logic-functions/utils/get-granola-webhook-destination-url-or-throw.util';

export const removeAbandonedGranolaPersonalWebhooksOrThrow = async ({
  connectionId,
  client,
}: {
  connectionId: string;
  client: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    'listWebhookEndpoints' | 'deleteWebhookEndpoint'
  >;
}): Promise<void> => {
  const apiUrl = process.env.TWENTY_API_URL;

  if (!isNonEmptyString(apiUrl)) {
    throw new GranolaWebhookConfigurationError({
      message: 'TWENTY_API_URL is required to clean up Granola webhooks.',
    });
  }

  const expectedUrl = getGranolaWebhookDestinationUrlOrThrow({
    apiUrl,
    registrationId: getGranolaPersonalRegistrationId(connectionId),
  });
  const { webhook_endpoints: endpoints } = await client.listWebhookEndpoints();
  // Leave time for any in-flight registration to publish its endpoint.
  const staleBefore =
    Date.now() - 2_000 * GRANOLA_PERSONAL_RECONCILE_TIMEOUT_SECONDS;
  const abandonedCandidates = endpoints.filter(
    (endpoint) =>
      !endpoint.url_redacted &&
      endpoint.url === expectedUrl &&
      Date.parse(endpoint.created_at) < staleBefore,
  );

  for (const endpoint of abandonedCandidates) {
    const registration = await kv.get<GranolaPersonalWebhookRegistration>(
      getGranolaPersonalWebhookKey(connectionId),
    );

    if (endpoint.id !== registration?.webhookEndpointId) {
      await deleteStaleGranolaWebhookEndpointOrThrow({
        client,
        webhookEndpointId: endpoint.id,
      });
    }
  }
};
