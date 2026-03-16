import { ApiService } from '@/cli/utilities/api/api-service';
import { startCallbackServer } from '@/cli/utilities/auth/callback-server';
import { openBrowser } from '@/cli/utilities/auth/open-browser';
import { generatePkceChallenge } from '@/cli/utilities/auth/pkce';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { runSafe } from '@/cli/utilities/run-safe';
import axios from 'axios';

import { AUTH_ERROR_CODES, type CommandResult } from '@/cli/types';

export type AuthLoginOAuthOptions = {
  apiUrl: string;
  remote?: string;
  timeoutMs?: number;
};

export type OAuthDiscoveryResponse = {
  authorization_endpoint: string;
  token_endpoint: string;
  cli_client_id?: string;
};

const innerAuthLoginOAuth = async (
  options: AuthLoginOAuthOptions,
): Promise<CommandResult> => {
  const { apiUrl, remote, timeoutMs } = options;

  if (remote) {
    ConfigService.setActiveRemote(remote);
  }

  const configService = new ConfigService();

  const discoveryUrl = `${apiUrl}/.well-known/oauth-authorization-server`;

  let discovery: OAuthDiscoveryResponse;

  try {
    const response = await axios.get(discoveryUrl);

    discovery = response.data;
  } catch {
    return {
      success: false,
      error: {
        code: AUTH_ERROR_CODES.OAUTH_NOT_SUPPORTED,
        message: `Could not reach the OAuth discovery endpoint at ${discoveryUrl}. Ensure the server is running. Use --api-key instead.`,
      },
    };
  }

  if (!discovery.cli_client_id) {
    return {
      success: false,
      error: {
        code: AUTH_ERROR_CODES.OAUTH_NOT_SUPPORTED,
        message:
          'Server does not expose a CLI client ID. Ensure the server is up to date. Use --api-key instead.',
      },
    };
  }

  const clientId = discovery.cli_client_id;

  const { codeVerifier, codeChallenge } = generatePkceChallenge();

  const callbackServer = await startCallbackServer({ timeoutMs });

  try {
    const authUrl = new URL(discovery.authorization_endpoint);

    authUrl.searchParams.set('clientId', clientId);
    authUrl.searchParams.set('codeChallenge', codeChallenge);
    authUrl.searchParams.set('redirectUrl', callbackServer.callbackUrl);

    const browserOpened = await openBrowser(authUrl.toString());

    if (!browserOpened) {
      console.log(
        `\nOpen this URL in your browser to authenticate:\n${authUrl.toString()}\n`,
      );
    }

    const callbackResult = await callbackServer.waitForCallback();

    if (!callbackResult.success) {
      return {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.AUTH_FAILED,
          message: callbackResult.error,
        },
      };
    }

    const tokenResponse = await axios.post(discovery.token_endpoint, {
      grant_type: 'authorization_code',
      code: callbackResult.code,
      code_verifier: codeVerifier,
      redirect_uri: callbackServer.callbackUrl,
      client_id: clientId,
    });

    const { access_token: accessToken, refresh_token: refreshToken } =
      tokenResponse.data;

    await configService.setConfig({
      apiUrl,
      accessToken,
      refreshToken,
      oauthClientId: clientId,
    });

    const apiService = new ApiService({
      serverUrl: apiUrl,
      token: accessToken,
    });

    const validateAuth = await apiService.validateAuth();

    if (!validateAuth.authValid) {
      await configService.clearConfig();

      return {
        success: false,
        error: {
          code: AUTH_ERROR_CODES.AUTH_FAILED,
          message:
            'OAuth tokens received but authentication validation failed.',
        },
      };
    }

    return { success: true, data: undefined };
  } finally {
    callbackServer.close();
  }
};

export const authLoginOAuth = (
  options: AuthLoginOAuthOptions,
): Promise<CommandResult> =>
  runSafe(() => innerAuthLoginOAuth(options), AUTH_ERROR_CODES.AUTH_FAILED);
