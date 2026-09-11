import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';

export const deleteStaleGranolaWebhookEndpointOrThrow = async ({
  client,
  webhookEndpointId,
}: {
  client: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    'deleteWebhookEndpoint'
  >;
  webhookEndpointId: string;
}): Promise<void> => {
  try {
    await client.deleteWebhookEndpoint({ webhookEndpointId });
  } catch (error) {
    if (!(error instanceof GranolaApiError && error.status === 404)) {
      throw error;
    }
  }
};
