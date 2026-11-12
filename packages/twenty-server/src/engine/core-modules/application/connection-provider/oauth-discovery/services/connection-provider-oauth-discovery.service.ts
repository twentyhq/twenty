import { Injectable } from '@nestjs/common';

import {
  discoverAuthorizationServerMetadata,
  discoverOAuthProtectedResourceMetadata,
  isHttpsUrl,
  registerClient,
} from '@modelcontextprotocol/sdk/client/auth.js';
import {
  type AuthorizationServerMetadata,
  type OAuthClientInformationFull,
  type OAuthProtectedResourceMetadata,
} from '@modelcontextprotocol/sdk/shared/auth.js';
import {
  checkResourceAllowed,
  resourceUrlFromServerUrl,
} from '@modelcontextprotocol/sdk/shared/auth-utils.js';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderOAuthClientService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-client.service';
import { type OAuthDiscoveryStoredClient } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-stored-client.type';
import { buildOAuthDiscoveryClientMetadataUrl } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/build-oauth-discovery-client-metadata-url.util';
import { buildOAuthDiscoveryClientMetadata } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/build-oauth-discovery-client-metadata.util';
import { buildOAuthDiscoveryFetch } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/build-oauth-discovery-fetch.util';
import { isStoredOAuthClientUsable } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/is-stored-oauth-client-usable.util';
import { probeProtectedResource } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/probe-protected-resource.util';
import { type ResolvedOAuthClient } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';
import { type OAuthDiscoveryConnectionProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-discovery-provider.util';
import { buildAppOAuthCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-callback-url.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type DiscoveryTarget = {
  provider: OAuthDiscoveryConnectionProvider;
  workspaceId: string;
};

@Injectable()
export class ConnectionProviderOAuthDiscoveryService {
  constructor(
    private readonly oauthClientService: ConnectionProviderOAuthClientService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async resolveClientForAuthorization(
    target: DiscoveryTarget,
  ): Promise<ResolvedOAuthClient> {
    const fetchFn = this.buildFetch(target.workspaceId);
    const { resourceMetadataUrl, scope } = await this.probeResource({
      provider: target.provider,
      fetchFn,
    });
    const storedClient =
      (await this.findUsableStoredClient(target)) ??
      (await this.discoverAndStoreClient({
        target,
        fetchFn,
        resourceMetadataUrl,
      }));

    return this.toResolvedClient({ storedClient, scope });
  }

  async resolveClientForTokenRequest(
    target: DiscoveryTarget,
  ): Promise<ResolvedOAuthClient> {
    const storedClient = await this.oauthClientService.findStoredClientOrThrow({
      connectionProviderId: target.provider.id,
      workspaceId: target.workspaceId,
    });

    return this.toResolvedClient({ storedClient, scope: undefined });
  }

  async forgetRejectedClient({
    target,
    clientId,
  }: {
    target: DiscoveryTarget;
    clientId: string;
  }): Promise<void> {
    await this.oauthClientService.deleteClient({
      connectionProviderId: target.provider.id,
      workspaceId: target.workspaceId,
      clientId,
    });
  }

  private async findUsableStoredClient(
    target: DiscoveryTarget,
  ): Promise<OAuthDiscoveryStoredClient | null> {
    const storedClient = await this.oauthClientService.findStoredClient({
      connectionProviderId: target.provider.id,
      workspaceId: target.workspaceId,
    });

    if (
      isDefined(storedClient) &&
      isStoredOAuthClientUsable({
        storedClient,
        redirectUrl: this.getRedirectUrl(),
        clientMetadataUrl: this.getClientMetadataUrl(),
        now: new Date(),
      })
    ) {
      return storedClient;
    }

    return null;
  }

  private async discoverAndStoreClient({
    target,
    fetchFn,
    resourceMetadataUrl,
  }: {
    target: DiscoveryTarget;
    fetchFn: FetchLike;
    resourceMetadataUrl: URL | undefined;
  }): Promise<OAuthDiscoveryStoredClient> {
    const { provider, workspaceId } = target;
    const resourceUrl = provider.oauthDiscoveryConfig.resourceUrl;
    const resourceMetadata = await this.discoverResourceMetadata({
      resourceUrl,
      resourceMetadataUrl,
      fetchFn,
    });
    const authorizationServerUrl =
      resourceMetadata?.authorization_servers?.[0] ?? resourceUrl;
    const authorizationServerMetadata =
      await discoverAuthorizationServerMetadata(authorizationServerUrl, {
        fetchFn,
      });
    const clientInformation = await this.identifyClient({
      authorizationServerUrl,
      authorizationServerMetadata,
      fetchFn,
    });
    const client = {
      connectionProviderId: provider.id,
      workspaceId,
      redirectUri: this.getRedirectUrl(),
      registrationMethod:
        clientInformation.client_id === this.getClientMetadataUrl()
          ? ('CLIENT_ID_METADATA_DOCUMENT' as const)
          : ('DYNAMIC_CLIENT_REGISTRATION' as const),
      clientInformation,
      discoveryState: {
        authorizationServerUrl,
        authorizationServerMetadata,
        resourceMetadata,
        resourceMetadataUrl: resourceMetadataUrl?.toString(),
      },
    };
    const existingClient = await this.oauthClientService.findStoredClient({
      connectionProviderId: provider.id,
      workspaceId,
    });
    const isClientSaved = isDefined(existingClient)
      ? await this.oauthClientService.replaceClientIfUnchanged({
          client,
          expectedClientId: existingClient.clientInformation.client_id,
        })
      : await this.oauthClientService.insertClientIfAbsent(client);

    if (!isClientSaved) {
      const concurrentClient = await this.oauthClientService.findStoredClient({
        connectionProviderId: provider.id,
        workspaceId,
      });

      if (isDefined(concurrentClient)) {
        return concurrentClient;
      }
    }

    return { ...client, clientInformation };
  }

  private async discoverResourceMetadata({
    resourceUrl,
    resourceMetadataUrl,
    fetchFn,
  }: {
    resourceUrl: string;
    resourceMetadataUrl: URL | undefined;
    fetchFn: FetchLike;
  }): Promise<OAuthProtectedResourceMetadata | undefined> {
    let resourceMetadata: OAuthProtectedResourceMetadata;

    try {
      resourceMetadata = await discoverOAuthProtectedResourceMetadata(
        resourceUrl,
        { resourceMetadataUrl },
        fetchFn,
      );
    } catch {
      return undefined;
    }

    if (
      !checkResourceAllowed({
        requestedResource: resourceUrl,
        configuredResource: resourceMetadata.resource,
      })
    ) {
      throw new ConnectionProviderException(
        `Protected resource metadata of ${resourceUrl} names another resource: ${resourceMetadata.resource}`,
        ConnectionProviderExceptionCode.INVALID_REQUEST,
      );
    }

    return resourceMetadata;
  }

  private async identifyClient({
    authorizationServerUrl,
    authorizationServerMetadata,
    fetchFn,
  }: {
    authorizationServerUrl: string;
    authorizationServerMetadata: AuthorizationServerMetadata | undefined;
    fetchFn: FetchLike;
  }): Promise<OAuthClientInformationFull> {
    const clientMetadataUrl = this.getClientMetadataUrl();
    const clientMetadata = buildOAuthDiscoveryClientMetadata(
      this.twentyConfigService.get('SERVER_URL'),
    );

    if (
      authorizationServerMetadata?.client_id_metadata_document_supported &&
      isDefined(clientMetadataUrl)
    ) {
      return { client_id: clientMetadataUrl, ...clientMetadata };
    }

    return registerClient(authorizationServerUrl, {
      metadata: authorizationServerMetadata,
      clientMetadata,
      fetchFn,
    });
  }

  private async probeResource({
    provider,
    fetchFn,
  }: {
    provider: OAuthDiscoveryConnectionProvider;
    fetchFn: FetchLike;
  }) {
    try {
      return await probeProtectedResource({
        resourceUrl: provider.oauthDiscoveryConfig.resourceUrl,
        fetchFn,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new ConnectionProviderException(
        `Could not reach the resource of connection provider ${provider.id}: ${message}`,
        ConnectionProviderExceptionCode.INVALID_REQUEST,
      );
    }
  }

  private toResolvedClient({
    storedClient,
    scope,
  }: {
    storedClient: OAuthDiscoveryStoredClient;
    scope: string | undefined;
  }): ResolvedOAuthClient {
    const {
      authorizationServerUrl,
      authorizationServerMetadata,
      resourceMetadata,
    } = storedClient.discoveryState;
    const scopes =
      scope?.split(/\s+/).filter(Boolean) ??
      resourceMetadata?.scopes_supported ??
      [];

    return {
      authorizationEndpoint:
        authorizationServerMetadata?.authorization_endpoint ??
        new URL('/authorize', authorizationServerUrl).toString(),
      tokenEndpoint:
        authorizationServerMetadata?.token_endpoint ??
        new URL('/token', authorizationServerUrl).toString(),
      clientId: storedClient.clientInformation.client_id,
      clientSecret: storedClient.clientInformation.client_secret ?? null,
      scopes,
      resource:
        resourceMetadata?.resource ??
        resourceUrlFromServerUrl(
          storedClient.discoveryState.authorizationServerUrl,
        ).toString(),
      authorizationParams: null,
      tokenRequestContentType: 'form-urlencoded',
      usePkce: true,
    };
  }

  private getRedirectUrl(): string {
    return buildAppOAuthCallbackUrl(this.twentyConfigService.get('SERVER_URL'));
  }

  private getClientMetadataUrl(): string | null {
    const clientMetadataUrl = buildOAuthDiscoveryClientMetadataUrl(
      this.twentyConfigService.get('SERVER_URL'),
    );

    return isHttpsUrl(clientMetadataUrl) ? clientMetadataUrl : null;
  }

  private buildFetch(workspaceId: string): FetchLike {
    return buildOAuthDiscoveryFetch({
      secureHttpClientService: this.secureHttpClientService,
      workspaceId,
    });
  }
}
