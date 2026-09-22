import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_CONNECTOR_TOKEN_REFRESH_MARGIN_MS } from 'src/logic-functions/constants/teams-connector-token-refresh-margin-ms';
import { type TeamsBotCredentials } from 'src/logic-functions/types/teams-bot-credentials.type';
import { type TeamsConnectorToken } from 'src/logic-functions/types/teams-connector-token.type';
import { buildTeamsConnectorTokenKvKey } from 'src/logic-functions/utils/build-teams-connector-token-kv-key';
import { mintTeamsConnectorToken } from 'src/logic-functions/utils/mint-teams-connector-token';

const isTokenUsable = (
  token: TeamsConnectorToken | null,
): token is TeamsConnectorToken =>
  isDefined(token) &&
  token.expiresAtMs - TEAMS_CONNECTOR_TOKEN_REFRESH_MARGIN_MS > Date.now();

export const getTeamsConnectorToken = async (
  credentials: TeamsBotCredentials,
): Promise<string> => {
  const tokenKvKey = buildTeamsConnectorTokenKvKey(credentials.appId);

  const cachedToken = await kv.get<TeamsConnectorToken>(tokenKvKey);

  if (isTokenUsable(cachedToken)) {
    return cachedToken.accessToken;
  }

  const mintedToken = await mintTeamsConnectorToken(credentials);

  await kv.set(tokenKvKey, mintedToken);

  return mintedToken.accessToken;
};
