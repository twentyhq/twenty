import { isNonEmptyString, isPositiveInteger } from '@sniptt/guards';

import { TEAMS_CONNECTOR_TOKEN_SCOPE } from 'src/features/chat/logic-functions/constants/teams-connector-token-scope';
import { type TeamsBotCredentials } from 'src/features/chat/logic-functions/types/teams-bot-credentials.type';
import { type TeamsConnectorToken } from 'src/features/chat/logic-functions/types/teams-connector-token.type';

type TeamsConnectorTokenResponse = {
  access_token?: string;
  expires_in?: number;
};

export const mintTeamsConnectorToken = async ({
  appId,
  appPassword,
  tenantId,
}: TeamsBotCredentials): Promise<TeamsConnectorToken> => {
  const response = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: appId,
        client_secret: appPassword,
        scope: TEAMS_CONNECTOR_TOKEN_SCOPE,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to mint a Bot Connector token: ${response.status} ${response.statusText}`,
    );
  }

  const body: TeamsConnectorTokenResponse = await response.json();

  if (!isNonEmptyString(body.access_token)) {
    throw new Error('Bot Connector token response carried no access_token');
  }

  if (!isPositiveInteger(body.expires_in)) {
    throw new Error('Bot Connector token response carried no expires_in');
  }

  return {
    accessToken: body.access_token,
    expiresAtMs: Date.now() + body.expires_in * 1000,
  };
};
