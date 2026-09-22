import { isNonEmptyString } from '@sniptt/guards';

import { type TeamsBotCredentials } from 'src/logic-functions/types/teams-bot-credentials.type';

const MISSING_CREDENTIALS_ERROR =
  'Microsoft Teams is not configured. Set TEAMS_BOT_APP_ID, TEAMS_BOT_APP_PASSWORD and TEAMS_BOT_TENANT_ID on the Teams application registration in Twenty (Settings > Applications, admin only), using the Entra app registration behind your Azure Bot.';

export const getTeamsBotCredentials = ():
  | { success: true; credentials: TeamsBotCredentials }
  | { success: false; error: string } => {
  const appId = process.env.TEAMS_BOT_APP_ID;
  const appPassword = process.env.TEAMS_BOT_APP_PASSWORD;
  const tenantId = process.env.TEAMS_BOT_TENANT_ID;

  if (
    !isNonEmptyString(appId) ||
    !isNonEmptyString(appPassword) ||
    !isNonEmptyString(tenantId)
  ) {
    return { success: false, error: MISSING_CREDENTIALS_ERROR };
  }

  return { success: true, credentials: { appId, appPassword, tenantId } };
};
