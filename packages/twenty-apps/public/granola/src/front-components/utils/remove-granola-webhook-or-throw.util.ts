import { RestApiClient } from 'twenty-client-sdk/rest';
import { z } from 'zod';

import { GRANOLA_WEBHOOK_REMOVAL_ROUTE_PATH } from 'src/constants/granola-webhook-removal-route-path';

const REMOVAL_RESULT_SCHEMA = z.discriminatedUnion('success', [
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export const removeGranolaWebhookOrThrow = async (): Promise<void> => {
  const result = REMOVAL_RESULT_SCHEMA.parse(
    await new RestApiClient().post(
      `/s${GRANOLA_WEBHOOK_REMOVAL_ROUTE_PATH}`,
      {},
    ),
  );

  if (!result.success) {
    throw new Error(result.error);
  }
};
