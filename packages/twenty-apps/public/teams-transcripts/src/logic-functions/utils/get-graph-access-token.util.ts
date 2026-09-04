import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { kv, RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import {
  GRAPH_ACCESS_TOKEN_KEY_VALUE_KEY,
  GRAPH_ACCESS_TOKEN_REFRESH_MARGIN_SECONDS,
  MICROSOFT_GRAPH_DEFAULT_SCOPE,
  MICROSOFT_LOGIN_BASE_URL,
} from 'src/constants/teams.constant';
import { type GraphAccessToken } from 'src/logic-functions/types/graph-access-token.type';
import { getMicrosoftCredentials } from 'src/logic-functions/utils/get-microsoft-credentials.util';

type TokenResponseBody = {
  access_token?: unknown;
  expires_in?: unknown;
  error?: unknown;
  error_description?: unknown;
};

const isTokenUsable = (
  token: GraphAccessToken | null,
  now: number,
): token is GraphAccessToken =>
  token !== null &&
  isNonEmptyString(token.accessToken) &&
  token.expiresAt - GRAPH_ACCESS_TOKEN_REFRESH_MARGIN_SECONDS * 1_000 > now;

const requestClientCredentialsToken = async (
  now: number,
): Promise<GraphAccessToken> => {
  const { tenantId, clientId, clientSecret } = getMicrosoftCredentials();
  const response = await fetch(
    `${MICROSOFT_LOGIN_BASE_URL}/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: MICROSOFT_GRAPH_DEFAULT_SCOPE,
      }),
    },
  );
  const body = (await response.json().catch(() => ({}))) as TokenResponseBody;

  if (!response.ok || !isNonEmptyString(body.access_token)) {
    const description = isNonEmptyString(body.error_description)
      ? body.error_description
      : `HTTP ${response.status}`;
    const message = `Microsoft token request failed: ${description}`;

    if (response.status >= 500) {
      throw new RetryableLogicFunctionError(message);
    }

    throw new Error(message);
  }

  const expiresInSeconds = isNumber(body.expires_in) ? body.expires_in : 3_600;

  return {
    accessToken: body.access_token,
    expiresAt: now + expiresInSeconds * 1_000,
  };
};

// The token is shared across every logic function run of the workspace so a
// backfill of thousands of transcripts does not mint thousands of tokens.
export const getGraphAccessToken = async ({
  forceRefresh = false,
}: { forceRefresh?: boolean } = {}): Promise<string> => {
  const now = Date.now();

  if (!forceRefresh) {
    const cachedToken = await kv.get<GraphAccessToken>(
      GRAPH_ACCESS_TOKEN_KEY_VALUE_KEY,
    );

    if (isTokenUsable(cachedToken, now)) {
      return cachedToken.accessToken;
    }
  }

  const token = await requestClientCredentialsToken(now);

  await kv.set(GRAPH_ACCESS_TOKEN_KEY_VALUE_KEY, token);

  return token.accessToken;
};
