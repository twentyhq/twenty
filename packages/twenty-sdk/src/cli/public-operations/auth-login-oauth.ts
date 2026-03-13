import { ApiService } from '@/cli/utilities/api/api-service';
import { startCallbackServer } from '@/cli/utilities/auth/callback-server';
import { openBrowser } from '@/cli/utilities/auth/open-browser';
import { generatePkceChallenge } from '@/cli/utilities/auth/pkce';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { runSafe } from '@/cli/utilities/run-safe';
import axios from 'axios';

import { AUTH_ERROR_CODES, type CommandResult } from './types';

export type AuthLoginOAuthOptions = {
  apiUrl: string;
  workspace?: string;
  timeoutMs?: number;
};

export type OAuthDiscoveryResponse = {
  authorization_endpoint: string;
  token_endpoint: string;
  cli_client_id: string | null;
};

export type OAuthTokenResponse = {
  applicationAccessToken: string;
  applicationRefreshToken: string;
  expiresIn: number;
};

const innerAuthLoginOAuth = async (
  options: AuthLoginOAuthOptions,
): Promise<CommandResult> => {
  const { apiUrl, workspace, timeoutMs } = options;

  if (workspace) {
    ConfigService.setActiveWorkspace(workspace);
  }

  const configService = new ConfigService();

  // Step 1: Fetch OAuth discovery metadata
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
        message:
          'Could not reach the server OAuth discovery endpoint. Use --api-key instead.',
      },
    };
  }

  if (!discovery.cli_client_id) {
    return {
      success: false,
      error: {
        code: AUTH_ERROR_CODES.OAUTH_NOT_SUPPORTED,
        message:
          'Server does not support CLI OAuth login. Use --api-key instead.',
      },
    };
  }

  // Step 2: Generate PKCE challenge
  const { codeVerifier, codeChallenge } = generatePkceChallenge();

  // Step 3: Start local callback server
  const callbackServer = await startCallbackServer({ timeoutMs });

  try {
    // Step 4: Open browser to authorization endpoint
    const authUrl = new URL(discovery.authorization_endpoint);

    authUrl.searchParams.set('clientId', discovery.cli_client_id);
    authUrl.searchParams.set('codeChallenge', codeChallenge);
    authUrl.searchParams.set('redirectUrl', callbackServer.callbackUrl);

    const browserOpened = await openBrowser(authUrl.toString());

    if (!browserOpened) {
      console.log(
        `\nOpen this URL in your browser to authenticate:\n${authUrl.toString()}\n`,
      );
    }

    // Step 5: Wait for the callback
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

    // Step 6: Exchange authorization code for tokens
    const tokenResponse = await axios.post(discovery.token_endpoint, {
      grant_type: 'authorization_code',
      code: callbackResult.code,
      client_id: discovery.cli_client_id,
      code_verifier: codeVerifier,
      redirect_uri: callbackServer.callbackUrl,
    });

    const {
      access_token: applicationAccessToken,
      refresh_token: applicationRefreshToken,
    } = tokenResponse.data;

    // Step 7: Store tokens and OAuth client ID in config
    await configService.setConfig({
      apiUrl,
      applicationAccessToken,
      applicationRefreshToken,
      oauthClientId: discovery.cli_client_id,
    });

    // Step 8: Validate the token works
    const apiService = new ApiService({
      serverUrl: apiUrl,
      token: applicationAccessToken,
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
