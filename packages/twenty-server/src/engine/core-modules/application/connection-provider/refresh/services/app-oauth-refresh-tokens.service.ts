import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { assertOAuthProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import { type ConnectedAccountTokens } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { exchangeRefreshTokenForToken } from 'src/engine/core-modules/application/connection-provider/utils/exchange-refresh-token-for-token.util';
import { OAuthTokenEndpointError } from 'src/engine/core-modules/application/connection-provider/utils/post-oauth-token-request.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';

@Injectable()
export class AppOAuthRefreshAccessTokenService {
  private readonly logger = new Logger(AppOAuthRefreshAccessTokenService.name);

  constructor(
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async refreshTokens(
    connectedAccount: ConnectedAccountEntity,
    refreshToken: string,
  ): Promise<ConnectedAccountTokens> {
    if (!isDefined(connectedAccount.connectionProviderId)) {
      throw new ConnectedAccountRefreshAccessTokenException(
        `Connected account ${connectedAccount.id} has no connectionProviderId`,
        ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
      );
    }

    const { provider, clientId, clientSecret } = await this.resolveProvider(
      connectedAccount.connectionProviderId,
    );

    try {
      const tokenResponse = await exchangeRefreshTokenForToken({
        fetchFn: this.secureHttpClientService.createSsrfSafeFetch(),
        tokenEndpoint: provider.oauthConfig.tokenEndpoint,
        clientId,
        clientSecret,
        refreshToken,
        contentType: provider.oauthConfig.tokenRequestContentType,
      });

      return {
        accessToken: tokenResponse.accessToken,
        // Some providers (e.g. Google) keep the refresh token stable across
        // refreshes; others rotate. Fall back to the original when the
        // response omits one.
        refreshToken: tokenResponse.refreshToken ?? refreshToken,
      };
    } catch (error) {
      this.logger.warn(
        `App OAuth refresh failed for connected account ${connectedAccount.id}: ${(error as Error).message}`,
      );

      // 5xx and network/transport errors are transient — don't mark the
      // credential as permanently invalid. Only 4xx responses from the
      // token endpoint (esp. invalid_grant) imply the user must reconnect.
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

  // Provider lookup or credential resolution failed (provider deleted,
  // server admin hasn't filled in client_id/secret). Translate so callers
  // see one exception class regardless of provider.
  private async resolveProvider(connectionProviderId: string) {
    try {
      const provider =
        await this.connectionProviderService.findOneByIdOrThrow(
          connectionProviderId,
        );

      assertOAuthProvider(provider);

      const { clientId, clientSecret } =
        await this.connectionProviderService.getClientCredentials(provider);

      return { provider, clientId, clientSecret };
    } catch (error) {
      if (error instanceof ConnectionProviderException) {
        throw new ConnectedAccountRefreshAccessTokenException(
          error.message,
          ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
      }

      throw error;
    }
  }
}
