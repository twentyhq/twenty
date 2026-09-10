import { RestApiClient } from 'twenty-client-sdk/rest';
import { z } from 'zod';

const ACTION_RESULT_SCHEMA = z.discriminatedUnion('success', [
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export const postGranolaWebhookActionOrThrow = async (
  routePath: string,
): Promise<void> => {
  const result = ACTION_RESULT_SCHEMA.parse(
    await new RestApiClient().post(`/s${routePath}`, {}),
  );

  if (!result.success) {
    throw new Error(result.error);
  }
};
