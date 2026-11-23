import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderOAuthClientService } from 'src/engine/core-modules/application/connection-provider/oauth-client/connection-provider-oauth-client.service';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
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
    private readonly oauthClientService: ConnectionProviderOAuthClientService,
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

    const { provider, client } = await this.resolveClient({
      connectionProviderId: connectedAccount.connectionProviderId,
      workspaceId: connectedAccount.workspaceId,
    });

    try {
      const tokenResponse = await exchangeRefreshTokenForToken({
        fetchFn: this.secureHttpClientService.createSsrfSafeFetch(),
        client,
        refreshToken,
      });

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
      await this.oauthClientService.forgetClientIfRejected({
        provider,
        workspaceId: connectedAccount.workspaceId,
        client,
        error,
      });

      this.logger.warn(
        `App OAuth refresh failed for connected account ${connectedAccount.id}: ${(error as Error).message}`,
      );

      // Only 4xx token-endpoint responses (esp. invalid_grant) imply the
      // user must reconnect — 5xx and transport errors stay transient.
      const isTransient =
        !(error instanceof OAuthTokenEndpointError) || error.status >= 500;

      throw new ConnectedAccountRefreshAccessTokenException(
        `App OAuth refresh failed: ${(error as Error).message}`,
        isTransient
          ? ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR
          : ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      );
    }
  }

  private async resolveClient({
    connectionProviderId,
    workspaceId,
  }: {
    connectionProviderId: string;
    workspaceId: string;
  }) {
    try {
      const provider = await this.connectionProviderService.findOneByIdOrThrow({
        id: connectionProviderId,
        workspaceId,
      });

      if (provider.type !== 'oauth' && provider.type !== 'oauth-discovery') {
        throw new ConnectedAccountRefreshAccessTokenException(
          `Connection provider ${provider.id} of type ${provider.type} cannot refresh tokens`,
          ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
      }

      const client = await this.oauthClientService.resolveForTokenRequest({
        provider,
        workspaceId,
      });

      return { provider, client };
    } catch (error) {
      if (error instanceof ConnectionProviderException) {
        throw new ConnectedAccountRefreshAccessTokenException(
          error.message,
          error.code === ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED
            ? ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN
            : ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
      }

      throw error;
    }
  }
}
