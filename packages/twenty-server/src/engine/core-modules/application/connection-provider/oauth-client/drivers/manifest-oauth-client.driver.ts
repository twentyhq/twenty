import { Injectable } from '@nestjs/common';

import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import {
  type OAuthClientDriver,
  type OAuthClientDriverArgs,
} from 'src/engine/core-modules/application/connection-provider/oauth-client/types/oauth-client-driver.type';
import { type ResolvedOAuthClient } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';
import { assertOAuthProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';

@Injectable()
export class ManifestOAuthClientDriver implements OAuthClientDriver {
  constructor(
    private readonly connectionProviderService: ConnectionProviderService,
  ) {}

  async resolveForAuthorization({
    provider,
  }: OAuthClientDriverArgs): Promise<ResolvedOAuthClient> {
    return this.resolve(provider);
  }

  async resolveForTokenRequest({
    provider,
  }: OAuthClientDriverArgs): Promise<ResolvedOAuthClient> {
    return this.resolve(provider);
  }

  // The client is configured by an admin, so a rejection is theirs to fix
  async forgetRejectedClient(): Promise<void> {}

  private async resolve(
    provider: OAuthClientDriverArgs['provider'],
  ): Promise<ResolvedOAuthClient> {
    assertOAuthProvider(provider);

    const { clientId, clientSecret } =
      await this.connectionProviderService.getClientCredentials(provider);
    const {
      authorizationEndpoint,
      tokenEndpoint,
      scopes,
      authorizationParams,
      tokenRequestContentType,
      usePkce,
    } = provider.oauthConfig;

    return {
      authorizationEndpoint,
      tokenEndpoint,
      clientId,
      clientSecret,
      tokenEndpointAuthMethod: 'client_secret_post',
      scopes,
      resource: null,
      authorizationParams,
      tokenRequestContentType,
      shouldUsePkce: usePkce,
    };
  }
}
