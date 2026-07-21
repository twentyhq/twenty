import { type ConfigService } from '@/cli/utilities/config/config-service';
import { isOAuthInvalidClientError } from '@/cli/utilities/error/parse-server-error';

import { exchangeCredentialsForTokens } from './exchange-credentials-for-tokens';

const EXPIRATION_MARGIN_MS = 30_000;

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString(),
    );

    return payload.exp * 1_000 < Date.now() + EXPIRATION_MARGIN_MS;
  } catch {
    return false;
  }
};

export type AppTokenSources = {
  credentials?: { clientId: string; clientSecret: string };
  // Workspace-scoped token minting (generateApplicationToken mutation). Used
  // when the registration is not owned by this workspace (e.g. an app synced
  // from the marketplace catalog), where no client secret is available and
  // rotating the shared one would break the published app.
  fetchTokenPair?: () => Promise<
    { accessToken: string; refreshToken?: string } | undefined
  >;
};

export const ensureAppAccessTokenIsValidOrRefresh = async (
  configService: ConfigService,
  tokenSources?: AppTokenSources,
): Promise<string | undefined> => {
  const config = await configService.getConfig();

  if (config.appAccessToken && !isTokenExpired(config.appAccessToken)) {
    return config.appAccessToken;
  }

  if (config.appRefreshToken && config.appRegistrationClientId) {
    const response = await fetch(`${config.apiUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: config.appRefreshToken,
        client_id: config.appRegistrationClientId,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as {
        access_token: string;
        refresh_token?: string;
      };

      await configService.setConfig({
        appAccessToken: data.access_token,
        ...(data.refresh_token ? { appRefreshToken: data.refresh_token } : {}),
      });

      return data.access_token;
    }

    try {
      const body = await response.json();

      if (isOAuthInvalidClientError(body)) {
        await configService.setConfig({
          appRegistrationId: undefined,
          appRegistrationClientId: undefined,
          appAccessToken: undefined,
          appRefreshToken: undefined,
        });
      }
    } catch {
      // Non-JSON error response (e.g. proxy 502) — fall through to the other token sources
    }
  }

  if (tokenSources?.fetchTokenPair) {
    const tokenPair = await tokenSources.fetchTokenPair();

    if (tokenPair) {
      await configService.setConfig({
        appAccessToken: tokenPair.accessToken,
        ...(tokenPair.refreshToken
          ? { appRefreshToken: tokenPair.refreshToken }
          : {}),
      });

      return tokenPair.accessToken;
    }
  }

  if (tokenSources?.credentials) {
    const result = await exchangeCredentialsForTokens(
      configService,
      tokenSources.credentials,
    );

    return result.accessToken;
  }

  return undefined;
};
