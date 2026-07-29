import { isNonEmptyString } from '@sniptt/guards';

export const SLACK_WEBHOOK_SECRET_ENV_VAR = 'SLACK_WEBHOOK_SECRET';

export const getSlackWebhookSecret = ():
  | { success: true; secret: string }
  | { success: false; error: string } => {
  const secret = process.env[SLACK_WEBHOOK_SECRET_ENV_VAR];

  if (!isNonEmptyString(secret)) {
    return {
      success: false,
      error:
        'SLACK_WEBHOOK_SECRET application variable is not set. Set it in the Twenty Slack app settings, using the signing secret from your Slack app (Basic Information > App Credentials).',
    };
  }

  return { success: true, secret };
};
