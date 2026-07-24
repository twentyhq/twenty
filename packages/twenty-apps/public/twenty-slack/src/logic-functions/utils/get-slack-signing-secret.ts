import { isNonEmptyString } from '@sniptt/guards';

import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';

export const getSlackSigningSecret = ():
  | { success: true; secret: string }
  | { success: false; error: string } => {
  const secret = getApplicationVariableValue('SLACK_WEBHOOK_SIGNATURE');

  if (!isNonEmptyString(secret)) {
    return {
      success: false,
      error:
        'SLACK_WEBHOOK_SIGNATURE is not configured. Set it in the application registration settings (Settings > Applications > Twenty Slack).',
    };
  }

  return { success: true, secret };
};
