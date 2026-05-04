import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationOAuthProviderException } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.exception';
import { ApplicationOAuthProviderService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.service';
import { type ConnectedAccountTokens } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { exchangeRefreshTokenForToken } from 'src/engine/core-modules/application/application-oauth-provider/utils/exchange-refresh-token-for-token.util';
import { OAuthTokenEndpointError } from 'src/engine/core-modules/application/application-oauth-provider/utils/post-oauth-token-request.util';
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
    private readonly applicationOAuthProviderService: ApplicationOAuthProviderService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async refreshTokens(
    connectedAccount: ConnectedAccountEntity,
    refreshToken: string,
  ): Promise<ConnectedAccountTokens> {
    if (!isDefined(connectedAccount.applicationConnectionProviderId)) {
      throw new ConnectedAccountRefreshAccessTokenException(
        `Connected account ${connectedAccount.id} has no applicationConnectionProviderId`,
        ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
      );
    }

    let provider, clientId, clientSecret;

    try {
      provider = await this.applicationOAuthProviderService.findOneByIdOrThrow(
        connectedAccount.applicationConnectionProviderId,
      );
      ({ clientId, clientSecret } =
        await this.applicationOAuthProviderService.getClientCredentials(
          provider,
        ));
    } catch (error) {
      // Provider lookup or credential resolution failed (provider deleted,
      // server admin hasn't filled in client_id/secret). Translate so callers
      // see one exception class regardless of provider.
      if (error instanceof ApplicationOAuthProviderException) {
        throw new ConnectedAccountRefreshAccessTokenException(
          error.message,
          ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
        );
      }

      throw error;
    }

    try {
      const tokenResponse = await exchangeRefreshTokenForToken({
        fetchFn: this.secureHttpClientService.createSsrfSafeFetch(),
        tokenEndpoint: provider.tokenEndpoint,
        clientId,
        clientSecret,
        refreshToken,
        contentType: provider.tokenRequestContentType,
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
}
