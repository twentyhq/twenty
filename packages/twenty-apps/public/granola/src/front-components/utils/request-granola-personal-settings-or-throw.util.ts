import { RestApiClient } from 'twenty-client-sdk/rest';
import { z } from 'zod';

import { GRANOLA_PERSONAL_SETTINGS_ROUTE_PATH } from 'src/constants/granola-personal-connection.constant';
import { type GranolaPersonalSettingsRequest } from 'src/types/granola-personal-settings-request.type';

const PERSONAL_SETTINGS_ERROR_SCHEMA = z.object({
  success: z.literal(false),
  error: z.string(),
});

export const requestGranolaPersonalSettingsOrThrow = async <TResponse>({
  request,
  responseSchema,
}: {
  request: GranolaPersonalSettingsRequest;
  responseSchema: z.ZodType<TResponse>;
}): Promise<TResponse> => {
  const response = await new RestApiClient().post(
    `/s${GRANOLA_PERSONAL_SETTINGS_ROUTE_PATH}`,
    request,
  );
  const error = PERSONAL_SETTINGS_ERROR_SCHEMA.safeParse(response);

  if (error.success) {
    throw new Error(error.data.error);
  }

  return responseSchema.parse(response);
};
