import { RestApiClient } from 'twenty-client-sdk/rest';
import { z } from 'zod';

const GRANOLA_SETTINGS_ROUTE_RESULT_SCHEMA = z.discriminatedUnion('success', [
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export const postGranolaSettingsRouteOrThrow = async ({
  routePath,
  body,
}: {
  routePath: string;
  body: Record<string, unknown>;
}): Promise<void> => {
  const result = GRANOLA_SETTINGS_ROUTE_RESULT_SCHEMA.parse(
    await new RestApiClient().post(`/s${routePath}`, body),
  );

  if (!result.success) {
    throw new Error(result.error);
  }
};
