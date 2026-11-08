import { Injectable, Logger } from '@nestjs/common';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { type ConnectionProviderOAuthGrant } from 'src/engine/core-modules/application/connection-provider/types/connection-provider-oauth-grant.type';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { assertOAuthProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import { buildAppOAuthCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-callback-url.util';
import { computePkceChallenge } from 'src/engine/core-modules/application/connection-provider/utils/compute-pkce-challenge.util';
import { exchangeCodeForToken } from 'src/engine/core-modules/application/connection-provider/utils/exchange-code-for-token.util';
import { exchangeRefreshTokenForToken } from 'src/engine/core-modules/application/connection-provider/utils/exchange-refresh-token-for-token.util';
import { generatePkceVerifier } from 'src/engine/core-modules/application/connection-provider/utils/generate-pkce-verifier.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// 'oauth' providers: the app declares the endpoints and the server admin registers the client.
@Injectable()
export class ConnectionProviderDeclaredOAuthService implements ConnectionProviderOAuthGrant {
  private readonly logger = new Logger(
    ConnectionProviderDeclaredOAuthService.name,
  );

  constructor(
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async prepareAuthorization({
    provider,
  }: {
    provider: ConnectionProviderEntity;
  }): Promise<{ authorizationUrl: URL; codeVerifier: string | null }> {
    assertOAuthProvider(provider);

    const { clientId } =
      await this.connectionProviderService.getClientCredentials(provider);
    const { authorizationEndpoint, scopes, authorizationParams, usePkce } =
      provider.oauthConfig;
    const codeVerifier = usePkce ? generatePkceVerifier() : null;
    const authorizationUrl = new URL(authorizationEndpoint);

    authorizationUrl.searchParams.set('client_id', clientId);
    authorizationUrl.searchParams.set('redirect_uri', this.getCallbackUrl());
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('scope', scopes.join(' '));

    if (codeVerifier) {
      authorizationUrl.searchParams.set(
        'code_challenge',
        computePkceChallenge(codeVerifier),
      );
      authorizationUrl.searchParams.set('code_challenge_method', 'S256');
    }

    for (const [key, value] of Object.entries(authorizationParams ?? {})) {
      authorizationUrl.searchParams.set(key, value);
    }

    return { authorizationUrl, codeVerifier };
  }

  async exchangeCode({
    provider,
    code,
    codeVerifier,
  }: {
    provider: ConnectionProviderEntity;
    code: string;
    codeVerifier: string | null;
  }): Promise<TokenExchangeResponse> {
    assertOAuthProvider(provider);

    const { clientId, clientSecret } =
      await this.connectionProviderService.getClientCredentials(provider);

    try {
      return await exchangeCodeForToken({
        fetchFn: this.secureHttpClientService.createSsrfSafeFetch(),
        tokenEndpoint: provider.oauthConfig.tokenEndpoint,
        clientId,
        clientSecret,
        code,
        redirectUri: this.getCallbackUrl(),
        codeVerifier,
        contentType: provider.oauthConfig.tokenRequestContentType,
      });
    } catch (error) {
      this.logger.error(
        `OAuth token exchange failed for provider ${provider.id}: ${(error as Error).message}`,
      );

      throw new ConnectionProviderException(
        (error as Error).message,
        ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED,
      );
    }
  }

  async refreshTokens({
    provider,
    refreshToken,
  }: {
    provider: ConnectionProviderEntity;
    refreshToken: PlaintextString;
  }): Promise<TokenExchangeResponse> {
    assertOAuthProvider(provider);

    const { clientId, clientSecret } =
      await this.connectionProviderService.getClientCredentials(provider);

    return exchangeRefreshTokenForToken({
      fetchFn: this.secureHttpClientService.createSsrfSafeFetch(),
      tokenEndpoint: provider.oauthConfig.tokenEndpoint,
      clientId,
      clientSecret,
      refreshToken,
      contentType: provider.oauthConfig.tokenRequestContentType,
    });
  }

  private getCallbackUrl(): string {
    return buildAppOAuthCallbackUrl(this.twentyConfigService.get('SERVER_URL'));
  }
}
