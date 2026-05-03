import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationOAuthProviderService } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.service';
import { type AppOAuthTokens } from 'src/engine/core-modules/application/application-oauth-provider/refresh/types/app-oauth-tokens.type';
import { exchangeRefreshTokenForToken } from 'src/engine/core-modules/application/application-oauth-provider/utils/exchange-refresh-token-for-token.util';
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
  ): Promise<AppOAuthTokens> {
    if (!isDefined(connectedAccount.applicationConnectionProviderId)) {
      throw new ConnectedAccountRefreshAccessTokenException(
        `Connected account ${connectedAccount.id} has no applicationConnectionProviderId`,
        ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
      );
    }

    const provider =
      await this.applicationOAuthProviderService.findOneByIdOrThrow(
        connectedAccount.applicationConnectionProviderId,
      );

    const { clientId, clientSecret } =
      await this.applicationOAuthProviderService.getClientCredentials(provider);

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

      throw new ConnectedAccountRefreshAccessTokenException(
        `App OAuth refresh failed: ${(error as Error).message}`,
        ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      );
    }
  }
}
