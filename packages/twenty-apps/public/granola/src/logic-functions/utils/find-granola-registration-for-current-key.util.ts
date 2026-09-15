import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_WEBHOOK_REGISTRATION_KEY } from 'src/constants/granola.constant';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';
import { type GranolaWebhookRegistration } from 'src/logic-functions/types/granola-webhook-registration.type';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';

export const findGranolaRegistrationForCurrentKey = async (): Promise<
  GranolaWebhookRegistration | undefined
> => {
  const registration = await kv.get<GranolaWebhookRegistration>(
    GRANOLA_WEBHOOK_REGISTRATION_KEY,
  );

  if (
    !isDefined(registration) ||
    registration.apiKeyFingerprint !==
      getGranolaApiKeyFingerprint(
        process.env[GRANOLA_API_KEY_ENV_VAR_NAME] ?? '',
      )
  ) {
    return undefined;
  }

  return registration;
};
