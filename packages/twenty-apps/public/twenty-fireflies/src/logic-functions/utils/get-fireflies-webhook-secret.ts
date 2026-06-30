import { isNonEmptyString } from '@sniptt/guards';

export const FIREFLIES_WEBHOOK_SECRET_ENV_VAR = 'FIREFLIES_WEBHOOK_SECRET';

export const getFirefliesWebhookSecret = ():
  | { success: true; secret: string }
  | { success: false; error: string } => {
  const secret = process.env[FIREFLIES_WEBHOOK_SECRET_ENV_VAR];

  if (!isNonEmptyString(secret)) {
    return {
      success: false,
      error:
        'FIREFLIES_WEBHOOK_SECRET application variable is not set. Set it in Twenty Fireflies app settings, then configure the same value on the Fireflies side when registering the webhook URL.',
    };
  }

  return { success: true, secret };
};
