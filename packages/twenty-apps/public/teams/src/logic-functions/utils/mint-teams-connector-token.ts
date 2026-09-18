import { TEAMS_CONNECTOR_TOKEN_SCOPE } from 'src/logic-functions/constants/teams-connector-token-scope';
import { type TeamsBotCredentials } from 'src/logic-functions/types/teams-bot-credentials.type';
import { type TeamsConnectorToken } from 'src/logic-functions/types/teams-connector-token.type';

type TokenResponse = {
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

  const body = (await response.json()) as TokenResponse;

  if (typeof body.access_token !== 'string' || body.access_token.length === 0) {
    throw new Error('Bot Connector token response carried no access_token');
  }

  const expiresInSeconds =
    typeof body.expires_in === 'number' ? body.expires_in : 3600;

  return {
    accessToken: body.access_token,
    expiresAtMs: Date.now() + expiresInSeconds * 1000,
  };
};
