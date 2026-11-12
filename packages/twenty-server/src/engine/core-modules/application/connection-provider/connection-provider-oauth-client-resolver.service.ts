import { Injectable } from '@nestjs/common';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { ConnectionProviderOAuthDiscoveryService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-discovery.service';
import { type ResolvedOAuthClient } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';
import { assertOAuthDiscoveryProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-discovery-provider.util';
import { assertOAuthProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import { OAuthTokenEndpointError } from 'src/engine/core-modules/application/connection-provider/utils/post-oauth-token-request.util';

type ResolveArgs = {
  provider: ConnectionProviderEntity;
  workspaceId: string;
};

@Injectable()
export class ConnectionProviderOAuthClientResolverService {
  constructor(
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly oauthDiscoveryService: ConnectionProviderOAuthDiscoveryService,
  ) {}

  async resolveForAuthorization({
    provider,
    workspaceId,
  }: ResolveArgs): Promise<ResolvedOAuthClient> {
    if (provider.type === 'oauth-discovery') {
      assertOAuthDiscoveryProvider(provider);

      return this.oauthDiscoveryService.resolveClientForAuthorization({
        provider,
        workspaceId,
      });
    }

    return this.resolveFromManifest(provider);
  }

  async resolveForTokenRequest({
    provider,
    workspaceId,
  }: ResolveArgs): Promise<ResolvedOAuthClient> {
    if (provider.type === 'oauth-discovery') {
      assertOAuthDiscoveryProvider(provider);

      return this.oauthDiscoveryService.resolveClientForTokenRequest({
        provider,
        workspaceId,
      });
    }

    return this.resolveFromManifest(provider);
  }

  async forgetClientIfRejected({
    provider,
    workspaceId,
    client,
    error,
  }: ResolveArgs & {
    client: ResolvedOAuthClient;
    error: unknown;
  }): Promise<void> {
    if (
      provider.type !== 'oauth-discovery' ||
      !(error instanceof OAuthTokenEndpointError) ||
      error.errorCode !== 'invalid_client'
    ) {
      return;
    }

    assertOAuthDiscoveryProvider(provider);

    await this.oauthDiscoveryService.forgetRejectedClient({
      target: { provider, workspaceId },
      clientId: client.clientId,
    });
  }

  private async resolveFromManifest(
    provider: ConnectionProviderEntity,
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
