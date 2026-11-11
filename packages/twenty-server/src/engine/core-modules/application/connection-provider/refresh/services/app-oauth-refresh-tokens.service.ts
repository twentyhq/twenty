import { Injectable, Logger } from '@nestjs/common';

import {
  OAuthError,
  ServerError,
  TemporarilyUnavailableError,
  TooManyRequestsError,
} from '@modelcontextprotocol/sdk/server/auth/errors.js';
import { isDefined } from 'twenty-shared/utils';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { ConnectionProviderOAuthDiscoveryTokenService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-discovery-token.service';
import { assertOAuthDiscoveryProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-discovery-provider.util';
import { assertOAuthProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import { exchangeRefreshTokenForToken } from 'src/engine/core-modules/application/connection-provider/utils/exchange-refresh-token-for-token.util';
import { OAuthTokenEndpointError } from 'src/engine/core-modules/application/connection-provider/utils/post-oauth-token-request.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { type ConnectedAccountPlaintextTokens } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

@Injectable()
export class AppOAuthRefreshAccessTokenService {
  private readonly logger = new Logger(AppOAuthRefreshAccessTokenService.name);

  constructor(
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly oauthDiscoveryTokenService: ConnectionProviderOAuthDiscoveryTokenService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async refreshTokens(
    connectedAccount: ConnectedAccountEntity,
    refreshToken: PlaintextString,
  ): Promise<ConnectedAccountPlaintextTokens> {
    if (!isDefined(connectedAccount.connectionProviderId)) {
      throw new ConnectedAccountRefreshAccessTokenException(
        `Connected account ${connectedAccount.id} has no connectionProviderId`,
        ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
      );
    }

    const provider = await this.findProvider({
      connectionProviderId: connectedAccount.connectionProviderId,
      workspaceId: connectedAccount.workspaceId,
    });

    if (provider.type !== 'oauth' && provider.type !== 'oauth-discovery') {
      throw new ConnectedAccountRefreshAccessTokenException(
        `Connection provider ${provider.id} of type ${provider.type} cannot refresh tokens`,
        ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
      );
    }

    try {
      const tokenResponse =
        provider.type === 'oauth-discovery'
          ? await this.refreshOAuthDiscoveryTokens({
              provider,
              workspaceId: connectedAccount.workspaceId,
              refreshToken,
            })
          : await this.refreshOAuthTokens({ provider, refreshToken });

      return {
        accessToken: tokenResponse.accessToken,
        // Fall back to the original when the response omits one — some
        // providers don't rotate refresh tokens.
        refreshToken: isDefined(tokenResponse.refreshToken)
          ? tokenResponse.refreshToken
          : refreshToken,
        accessTokenExpiresAt: tokenResponse.accessTokenExpiresAt,
      };
    } catch (error) {
      if (error instanceof ConnectedAccountRefreshAccessTokenException) {
        throw error;
      }

      this.logger.warn(
        `App OAuth refresh failed for connected account ${connectedAccount.id}: ${(error as Error).message}`,
      );

      throw new ConnectedAccountRefreshAccessTokenException(
        `App OAuth refresh failed: ${(error as Error).message}`,
        this.isTransientRefreshError(error)
          ? ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR
          : ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      );
    }
  }

  private async refreshOAuthTokens({
    provider,
    refreshToken,
  }: {
    provider: ConnectionProviderEntity;
    refreshToken: PlaintextString;
  }) {
    assertOAuthProvider(provider);

    const { clientId, clientSecret } =
      await this.resolveClientCredentials(provider);

    return exchangeRefreshTokenForToken({
      fetchFn: this.secureHttpClientService.createSsrfSafeFetch(),
      tokenEndpoint: provider.oauthConfig.tokenEndpoint,
      clientId,
      clientSecret,
      refreshToken,
      contentType: provider.oauthConfig.tokenRequestContentType,
    });
  }

  private async refreshOAuthDiscoveryTokens({
    provider,
    workspaceId,
    refreshToken,
  }: {
    provider: ConnectionProviderEntity;
    workspaceId: string;
    refreshToken: PlaintextString;
  }) {
    assertOAuthDiscoveryProvider(provider);

    try {
      return await this.oauthDiscoveryTokenService.refreshTokens({
        provider,
        workspaceId,
        refreshToken,
      });
    } catch (error) {
      if (error instanceof ConnectionProviderException) {
        throw new ConnectedAccountRefreshAccessTokenException(
          error.message,
          ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
        );
      }

      throw error;
    }
  }

  private isTransientRefreshError(error: unknown): boolean {
    if (error instanceof OAuthTokenEndpointError) {
      return error.status >= 500;
    }

    if (error instanceof OAuthError) {
      return (
        error instanceof ServerError ||
        error instanceof TemporarilyUnavailableError ||
        error instanceof TooManyRequestsError
      );
    }

    return true;
  }

  private async findProvider({
    connectionProviderId,
    workspaceId,
  }: {
    connectionProviderId: string;
    workspaceId: string;
  }): Promise<ConnectionProviderEntity> {
    try {
      return await this.connectionProviderService.findOneByIdOrThrow({
        id: connectionProviderId,
        workspaceId,
      });
    } catch (error) {
      throw this.toProviderNotSupportedError(error);
    }
  }

  private async resolveClientCredentials(provider: ConnectionProviderEntity) {
    try {
      return await this.connectionProviderService.getClientCredentials(
        provider,
      );
    } catch (error) {
      throw this.toProviderNotSupportedError(error);
    }
  }

  private toProviderNotSupportedError(error: unknown): unknown {
    return error instanceof ConnectionProviderException
      ? new ConnectedAccountRefreshAccessTokenException(
          error.message,
          ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
        )
      : error;
  }
}
