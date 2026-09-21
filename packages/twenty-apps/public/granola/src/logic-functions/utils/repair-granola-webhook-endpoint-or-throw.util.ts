import { type GranolaWebhookEndpoint } from 'src/logic-functions/types/granola-api.type';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';

export const repairGranolaWebhookEndpointOrThrow = async ({
  client,
  endpoint,
  expectedUrl,
}: {
  client: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    'updateWebhookEndpoint'
  >;
  endpoint: GranolaWebhookEndpoint;
  expectedUrl: string;
}): Promise<GranolaWebhookEndpoint> => {
  const isUrlStale = !endpoint.url_redacted && endpoint.url !== expectedUrl;

  if (endpoint.enabled && !isUrlStale) {
    return endpoint;
  }

  return client.updateWebhookEndpoint({
    webhookEndpointId: endpoint.id,
    enabled: true,
    ...(isUrlStale ? { url: expectedUrl } : {}),
  });
};
