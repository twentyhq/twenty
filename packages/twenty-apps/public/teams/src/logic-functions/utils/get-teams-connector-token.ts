import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_CONNECTOR_TOKEN_KV_KEY } from 'src/logic-functions/constants/teams-connector-token-kv-key';
import { TEAMS_CONNECTOR_TOKEN_REFRESH_MARGIN_MS } from 'src/logic-functions/constants/teams-connector-token-refresh-margin-ms';
import { type TeamsBotCredentials } from 'src/logic-functions/types/teams-bot-credentials.type';
import { type TeamsConnectorToken } from 'src/logic-functions/types/teams-connector-token.type';
import { mintTeamsConnectorToken } from 'src/logic-functions/utils/mint-teams-connector-token';

const isTokenUsable = (
  token: TeamsConnectorToken | null,
): token is TeamsConnectorToken =>
  isDefined(token) &&
  token.expiresAtMs - TEAMS_CONNECTOR_TOKEN_REFRESH_MARGIN_MS > Date.now();

export const getTeamsConnectorToken = async (
  credentials: TeamsBotCredentials,
): Promise<string> => {
  const cachedToken = await kv.get<TeamsConnectorToken>(
    TEAMS_CONNECTOR_TOKEN_KV_KEY,
  );

  if (isTokenUsable(cachedToken)) {
    return cachedToken.accessToken;
  }

  const mintedToken = await mintTeamsConnectorToken(credentials);

  await kv.set(TEAMS_CONNECTOR_TOKEN_KV_KEY, mintedToken);

  return mintedToken.accessToken;
};
