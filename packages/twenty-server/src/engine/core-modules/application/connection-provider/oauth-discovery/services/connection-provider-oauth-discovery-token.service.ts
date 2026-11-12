import { Injectable, Logger } from '@nestjs/common';

import {
  auth,
  refreshAuthorization,
} from '@modelcontextprotocol/sdk/client/auth.js';
import {
  InvalidClientError,
  UnauthorizedClientError,
} from '@modelcontextprotocol/sdk/server/auth/errors.js';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { OAUTH_DISCOVERY_REQUEST_TIMEOUT_MS } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/constants/oauth-discovery-request-timeout-ms.constant';
import { ConnectionProviderOAuthClientService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-client.service';
import { type OAuthDiscoveryProviderContext } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-provider-context.type';
import { buildOAuthDiscoveryClientProvider } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/build-oauth-discovery-client-provider.util';
import { isPermanentOAuthDiscoveryRefreshError } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/is-permanent-oauth-discovery-refresh-error.util';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { parseTokenResponse } from 'src/engine/core-modules/application/connection-provider/utils/parse-token-response.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class ConnectionProviderOAuthDiscoveryTokenService {
  private readonly logger = new Logger(
    ConnectionProviderOAuthDiscoveryTokenService.name,
  );

  constructor(
    private readonly oauthClientService: ConnectionProviderOAuthClientService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async exchangeCode({
    provider,
    workspaceId,
    code,
    codeVerifier,
    clientId,
  }: OAuthDiscoveryProviderContext & {
    code: string;
    codeVerifier: string;
    clientId: string;
  }): Promise<TokenExchangeResponse> {
    const storedClient = await this.oauthClientService.findStoredClientOrThrow({
      connectionProviderId: provider.id,
      workspaceId,
    });

    if (storedClient.clientInformation.client_id !== clientId) {
      throw new ConnectionProviderException(
        `OAuth client of connection provider ${provider.id} changed during sign-in: sign in again`,
        ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED,
      );
    }

    const clientProvider = buildOAuthDiscoveryClientProvider({
      serverUrl: this.twentyConfigService.get('SERVER_URL'),
      storedClient,
      codeVerifier,
      shouldReuseStoredDiscoveryState: true,
    });

    try {
      await auth(clientProvider, {
        serverUrl: provider.oauthDiscoveryConfig.resourceUrl,
        authorizationCode: code,
        fetchFn: this.buildFetch(workspaceId),
      });
    } catch (error) {
      throw new ConnectionProviderException(
        error instanceof Error ? error.message : String(error),
        ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED,
      );
    } finally {
      if (clientProvider.isStoredClientInvalidated) {
        await this.oauthClientService.deleteClient({
          connectionProviderId: provider.id,
          workspaceId,
          clientId,
        });
      }
    }

    if (!isDefined(clientProvider.savedTokens)) {
      throw new ConnectionProviderException(
        `OAuth discovery provider ${provider.id} returned no tokens`,
        ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED,
      );
    }

    return parseTokenResponse(clientProvider.savedTokens);
  }

  async refreshTokens({
    provider,
    workspaceId,
    refreshToken,
  }: OAuthDiscoveryProviderContext & {
    refreshToken: PlaintextString;
  }): Promise<TokenExchangeResponse> {
    const storedClient = await this.oauthClientService.findStoredClientOrThrow({
      connectionProviderId: provider.id,
      workspaceId,
    });
    const {
      authorizationServerUrl,
      authorizationServerMetadata,
      resourceMetadata,
    } = storedClient.discoveryState;

    try {
      const tokens = await refreshAuthorization(authorizationServerUrl, {
        metadata: authorizationServerMetadata,
        clientInformation: storedClient.clientInformation,
        refreshToken,
        resource: resourceMetadata?.resource,
        fetchFn: this.buildFetch(workspaceId),
      });

      return parseTokenResponse(tokens);
    } catch (error) {
      // The authorization server forgot the client: the next sign-in registers a new one.
      if (
        error instanceof InvalidClientError ||
        error instanceof UnauthorizedClientError
      ) {
        await this.deleteRejectedClient({
          connectionProviderId: provider.id,
          workspaceId,
          clientId: storedClient.clientInformation.client_id,
        });
      }

      if (isPermanentOAuthDiscoveryRefreshError(error)) {
        throw new ConnectionProviderException(
          error instanceof Error ? error.message : String(error),
          ConnectionProviderExceptionCode.REFRESH_FAILED,
        );
      }

      throw error;
    }
  }

  // The server's rejection is the error worth surfacing; a failed cleanup must not turn it into a transient one.
  private async deleteRejectedClient(target: {
    connectionProviderId: string;
    workspaceId: string;
    clientId: string;
  }): Promise<void> {
    try {
      await this.oauthClientService.deleteClient(target);
    } catch (error) {
      this.logger.warn(
        `Could not delete the rejected OAuth client of connection provider ${target.connectionProviderId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private buildFetch(workspaceId: string): FetchLike {
    return this.secureHttpClientService.createFetchLike({
      context: { workspaceId, source: 'connection-provider' },
      timeoutMs: OAUTH_DISCOVERY_REQUEST_TIMEOUT_MS,
    });
  }
}
