import { isNonEmptyString } from '@sniptt/guards';

export const getSlackSigningSecret = ():
  | { success: true; secret: string }
  | { success: false; error: string } => {
  const secret = process.env.SLACK_SIGNING_SECRET;

  if (!isNonEmptyString(secret)) {
    return {
      success: false,
      error:
        'SLACK_SIGNING_SECRET is not configured. Set it in the application registration settings (Settings > Applications > Twenty Slack).',
    };
  }

  return { success: true, secret };
};
