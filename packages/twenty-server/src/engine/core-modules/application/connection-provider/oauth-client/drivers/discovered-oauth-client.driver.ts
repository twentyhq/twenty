import { Injectable } from '@nestjs/common';

import {
  discoverAuthorizationServerMetadata,
  discoverOAuthProtectedResourceMetadata,
  isHttpsUrl,
  type OAuthDiscoveryState,
  registerClient,
} from '@modelcontextprotocol/sdk/client/auth.js';
import {
  type OAuthClientInformationFull,
  type OAuthProtectedResourceMetadata,
} from '@modelcontextprotocol/sdk/shared/auth.js';
import {
  checkResourceAllowed,
  resourceUrlFromServerUrl,
} from '@modelcontextprotocol/sdk/shared/auth-utils.js';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';
import isEqual from 'lodash.isequal';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import {
  ConnectionProviderDiscoveredOAuthClientService,
  type OAuthDiscoveryClientToSave,
} from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-discovered-oauth-client.service';
import {
  type OAuthClientDriver,
  type OAuthClientDriverArgs,
} from 'src/engine/core-modules/application/connection-provider/oauth-client/types/oauth-client-driver.type';
import { type OAuthDiscoveryStoredClient } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-stored-client.type';
import { buildOAuthDiscoveryClientMetadataUrl } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/build-oauth-discovery-client-metadata-url.util';
import { buildOAuthDiscoveryClientMetadata } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/build-oauth-discovery-client-metadata.util';
import { isStoredOAuthClientUsable } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/is-stored-oauth-client-usable.util';
import { probeProtectedResource } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/probe-protected-resource.util';
import { resolveTokenEndpointAuthMethod } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/resolve-token-endpoint-auth-method.util';
import { type ResolvedOAuthClient } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';
import {
  assertOAuthDiscoveryProvider,
  type OAuthDiscoveryConnectionProvider,
} from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-discovery-provider.util';
import { buildAppOAuthCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-callback-url.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const OAUTH_DISCOVERY_REQUEST_TIMEOUT_MS = 15_000;

type DiscoveryTarget = {
  provider: Pick<
    OAuthDiscoveryConnectionProvider,
    'id' | 'oauthDiscoveryConfig'
  >;
  workspaceId: string;
};

@Injectable()
export class DiscoveredOAuthClientDriver implements OAuthClientDriver {
  constructor(
    private readonly discoveredOAuthClientService: ConnectionProviderDiscoveredOAuthClientService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async resolveForAuthorization(
    args: OAuthClientDriverArgs,
  ): Promise<ResolvedOAuthClient> {
    const target = this.toDiscoveryTarget(args);
    const fetchFunction = this.buildFetch(target.workspaceId);
    const { resourceMetadataUrl, scope } = await this.probeResource({
      target,
      fetchFunction,
    });
    const discoveryState = await this.discover({
      resourceUrl: target.provider.oauthDiscoveryConfig.resourceUrl,
      resourceMetadataUrl,
      fetchFunction,
    });
    const existingClient =
      await this.discoveredOAuthClientService.findStoredClient({
        connectionProviderId: target.provider.id,
        workspaceId: target.workspaceId,
      });
    const storedClient =
      isDefined(existingClient) &&
      this.canReuseStoredClient({
        storedClient: existingClient,
        discoveryState,
      })
        ? await this.refreshDiscoveryState({
            target,
            storedClient: existingClient,
            discoveryState,
          })
        : await this.registerAndStoreClient({
            target,
            existingClient,
            discoveryState,
            fetchFunction,
          });

    return this.toResolvedClient({ storedClient, scope });
  }

  async resolveForTokenRequest(
    args: OAuthClientDriverArgs,
  ): Promise<ResolvedOAuthClient> {
    const target = this.toDiscoveryTarget(args);
    const storedClient =
      await this.discoveredOAuthClientService.findStoredClientOrThrow({
        connectionProviderId: target.provider.id,
        workspaceId: target.workspaceId,
      });

    return this.toResolvedClient({ storedClient, scope: undefined });
  }

  async forgetRejectedClient({
    clientId,
    ...args
  }: OAuthClientDriverArgs & { clientId: string }): Promise<void> {
    const target = this.toDiscoveryTarget(args);

    await this.discoveredOAuthClientService.deleteClient({
      connectionProviderId: target.provider.id,
      workspaceId: target.workspaceId,
      clientId,
    });
  }

  private toDiscoveryTarget({
    provider,
    workspaceId,
  }: OAuthClientDriverArgs): DiscoveryTarget {
    assertOAuthDiscoveryProvider(provider);

    return { provider, workspaceId };
  }

  private canReuseStoredClient({
    storedClient,
    discoveryState,
  }: {
    storedClient: OAuthDiscoveryStoredClient;
    discoveryState: OAuthDiscoveryState;
  }): boolean {
    return (
      storedClient.discoveryState.authorizationServerUrl ===
        discoveryState.authorizationServerUrl &&
      isStoredOAuthClientUsable({
        storedClient,
        redirectUrl: this.getRedirectUrl(),
        clientMetadataUrl: this.getClientMetadataUrl(),
        now: new Date(),
      })
    );
  }

  private async refreshDiscoveryState({
    target,
    storedClient,
    discoveryState,
  }: {
    target: DiscoveryTarget;
    storedClient: OAuthDiscoveryStoredClient;
    discoveryState: OAuthDiscoveryState;
  }): Promise<OAuthDiscoveryStoredClient> {
    if (isEqual(storedClient.discoveryState, discoveryState)) {
      return storedClient;
    }

    const client = { ...storedClient, discoveryState };

    await this.discoveredOAuthClientService.replaceClientIfUnchanged({
      client: this.toClientToSave({ target, client }),
      expectedClientId: storedClient.clientInformation.client_id,
    });

    return client;
  }

  private async registerAndStoreClient({
    target,
    existingClient,
    discoveryState,
    fetchFunction,
  }: {
    target: DiscoveryTarget;
    existingClient: OAuthDiscoveryStoredClient | null;
    discoveryState: OAuthDiscoveryState;
    fetchFunction: FetchLike;
  }): Promise<OAuthDiscoveryStoredClient> {
    const clientInformation = await this.identifyClient({
      discoveryState,
      fetchFunction,
    });
    const client: OAuthDiscoveryStoredClient = {
      redirectUri: this.getRedirectUrl(),
      registrationMethod:
        clientInformation.client_id === this.getClientMetadataUrl()
          ? 'CLIENT_ID_METADATA_DOCUMENT'
          : 'DYNAMIC_CLIENT_REGISTRATION',
      clientInformation,
      discoveryState,
    };
    const clientToSave = this.toClientToSave({ target, client });
    const isClientSaved = isDefined(existingClient)
      ? await this.discoveredOAuthClientService.replaceClientIfUnchanged({
          client: clientToSave,
          expectedClientId: existingClient.clientInformation.client_id,
        })
      : await this.discoveredOAuthClientService.insertClientIfAbsent(
          clientToSave,
        );

    if (isClientSaved) {
      return client;
    }

    // Another member's sign-in stored a client meanwhile: one client must issue every token
    const concurrentClient =
      await this.discoveredOAuthClientService.findStoredClient({
        connectionProviderId: target.provider.id,
        workspaceId: target.workspaceId,
      });

    return concurrentClient ?? client;
  }

  private async discover({
    resourceUrl,
    resourceMetadataUrl,
    fetchFunction,
  }: {
    resourceUrl: string;
    resourceMetadataUrl: URL | undefined;
    fetchFunction: FetchLike;
  }): Promise<OAuthDiscoveryState> {
    const resourceMetadata = await this.discoverResourceMetadata({
      resourceUrl,
      resourceMetadataUrl,
      fetchFunction,
    });
    const authorizationServerUrl =
      resourceMetadata?.authorization_servers?.[0] ?? resourceUrl;
    const authorizationServerMetadata =
      await discoverAuthorizationServerMetadata(authorizationServerUrl, {
        fetchFn: fetchFunction,
      });

    // jsonb drops undefined keys, so the stored state must compare equal to a fresh one
    return {
      authorizationServerUrl,
      ...(isDefined(authorizationServerMetadata) && {
        authorizationServerMetadata,
      }),
      ...(isDefined(resourceMetadata) && { resourceMetadata }),
      ...(isDefined(resourceMetadataUrl) && {
        resourceMetadataUrl: resourceMetadataUrl.toString(),
      }),
    };
  }

  private async discoverResourceMetadata({
    resourceUrl,
    resourceMetadataUrl,
    fetchFunction,
  }: {
    resourceUrl: string;
    resourceMetadataUrl: URL | undefined;
    fetchFunction: FetchLike;
  }): Promise<OAuthProtectedResourceMetadata | undefined> {
    let resourceMetadata: OAuthProtectedResourceMetadata;

    try {
      resourceMetadata = await discoverOAuthProtectedResourceMetadata(
        resourceUrl,
        { resourceMetadataUrl },
        fetchFunction,
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
    discoveryState,
    fetchFunction,
  }: {
    discoveryState: OAuthDiscoveryState;
    fetchFunction: FetchLike;
  }): Promise<OAuthClientInformationFull> {
    const { authorizationServerUrl, authorizationServerMetadata } =
      discoveryState;
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
      fetchFn: fetchFunction,
    });
  }

  private async probeResource({
    target,
    fetchFunction,
  }: {
    target: DiscoveryTarget;
    fetchFunction: FetchLike;
  }) {
    try {
      return await probeProtectedResource({
        resourceUrl: target.provider.oauthDiscoveryConfig.resourceUrl,
        fetchFunction,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new ConnectionProviderException(
        `Could not reach the resource of connection provider ${target.provider.id}: ${message}`,
        ConnectionProviderExceptionCode.INVALID_REQUEST,
      );
    }
  }

  private toClientToSave({
    target,
    client,
  }: {
    target: DiscoveryTarget;
    client: OAuthDiscoveryStoredClient;
  }): OAuthDiscoveryClientToSave {
    return {
      ...client,
      connectionProviderId: target.provider.id,
      workspaceId: target.workspaceId,
    };
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
    const probedScopes = scope?.split(/\s+/).filter(Boolean) ?? [];

    return {
      authorizationEndpoint:
        authorizationServerMetadata?.authorization_endpoint ??
        new URL('/authorize', authorizationServerUrl).toString(),
      tokenEndpoint:
        authorizationServerMetadata?.token_endpoint ??
        new URL('/token', authorizationServerUrl).toString(),
      clientId: storedClient.clientInformation.client_id,
      clientSecret: storedClient.clientInformation.client_secret ?? null,
      tokenEndpointAuthMethod: resolveTokenEndpointAuthMethod(
        storedClient.clientInformation,
      ),
      scopes: isNonEmptyArray(probedScopes)
        ? probedScopes
        : (resourceMetadata?.scopes_supported ?? []),
      resource:
        resourceMetadata?.resource ??
        resourceUrlFromServerUrl(authorizationServerUrl).toString(),
      authorizationParams: null,
      tokenRequestContentType: 'form-urlencoded',
      shouldUsePkce: true,
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
    return this.secureHttpClientService.createFetchLike({
      context: { workspaceId, source: 'connection-provider' },
      timeoutMs: OAUTH_DISCOVERY_REQUEST_TIMEOUT_MS,
    });
  }
}
