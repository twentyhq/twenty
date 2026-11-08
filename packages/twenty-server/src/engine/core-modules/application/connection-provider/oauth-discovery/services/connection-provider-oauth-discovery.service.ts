import { Injectable, Logger } from '@nestjs/common';

import {
  auth,
  isHttpsUrl,
  refreshAuthorization,
} from '@modelcontextprotocol/sdk/client/auth.js';
import {
  InvalidClientError,
  UnauthorizedClientError,
} from '@modelcontextprotocol/sdk/server/auth/errors.js';
import { type OAuthTokens } from '@modelcontextprotocol/sdk/shared/auth.js';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderOAuthClientService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-client.service';
import { type OAuthDiscoveryStoredClient } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-stored-client.type';
import {
  buildOAuthDiscoveryClientMetadata,
  buildOAuthDiscoveryClientMetadataUrl,
} from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/build-oauth-discovery-client-metadata.util';
import { probeProtectedResource } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/probe-protected-resource.util';
import { OAuthDiscoveryClientProvider } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/oauth-discovery-client-provider';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type ConnectionProviderOAuthGrant } from 'src/engine/core-modules/application/connection-provider/types/connection-provider-oauth-grant.type';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import {
  assertOAuthDiscoveryProvider,
  type OAuthDiscoveryConnectionProvider,
} from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-discovery-provider.util';
import { buildAppOAuthCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-callback-url.util';
import { parseAccessTokenExpiresAt } from 'src/engine/core-modules/application/connection-provider/utils/parse-access-token-expires-at.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const OAUTH_DISCOVERY_REQUEST_TIMEOUT_MS = 15_000;

type ProviderContext = {
  provider: OAuthDiscoveryConnectionProvider;
  workspaceId: string;
};

// Runs the MCP authorization flow for a protected resource: RFC 9728 discovery,
// a Client ID Metadata Document or dynamic registration, PKCE and resource indicators.
@Injectable()
export class ConnectionProviderOAuthDiscoveryService implements ConnectionProviderOAuthGrant {
  private readonly logger = new Logger(
    ConnectionProviderOAuthDiscoveryService.name,
  );

  constructor(
    private readonly oauthClientService: ConnectionProviderOAuthClientService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async prepareAuthorization({
    provider,
    workspaceId,
  }: {
    provider: ConnectionProviderEntity;
    workspaceId: string;
  }): Promise<{ authorizationUrl: URL; codeVerifier: string }> {
    assertOAuthDiscoveryProvider(provider);

    return this.prepareDiscoveredAuthorization({
      provider,
      workspaceId,
      canReuseConcurrentRegistration: true,
    });
  }

  private async prepareDiscoveredAuthorization({
    provider,
    workspaceId,
    canReuseConcurrentRegistration,
  }: ProviderContext & {
    canReuseConcurrentRegistration: boolean;
  }): Promise<{
    authorizationUrl: URL;
    codeVerifier: string;
  }> {
    const fetchFn = this.buildFetch(workspaceId);
    const { resourceMetadataUrl, scope } = await probeProtectedResource({
      resourceUrl: provider.oauthDiscoveryConfig.resourceUrl,
      fetchFn,
    });
    const storedClient = await this.oauthClientService.findStoredClient({
      connectionProviderId: provider.id,
      workspaceId,
    });

    const prepare = ({
      clientToReuse,
      isClientIdMetadataDocumentAllowed,
    }: {
      clientToReuse: OAuthDiscoveryStoredClient | null;
      isClientIdMetadataDocumentAllowed: boolean;
    }) =>
      this.runAuthorizationRequest({
        provider,
        fetchFn,
        resourceMetadataUrl,
        scope,
        clientProvider: this.buildClientProvider({
          storedClient: clientToReuse,
          shouldReuseStoredDiscoveryState: false,
          isClientIdMetadataDocumentAllowed,
        }),
      });

    const firstAttempt = await prepare({
      clientToReuse: storedClient,
      isClientIdMetadataDocumentAllowed: true,
    });
    const retryAttempt = await this.prepareReplacementIfRejected({
      firstAttempt,
      fetchFn,
      prepareReplacement: () =>
        prepare({
          clientToReuse: null,
          isClientIdMetadataDocumentAllowed:
            firstAttempt.clientToPersist.registrationMethod !==
            'CLIENT_ID_METADATA_DOCUMENT',
        }),
    });
    const attempt = retryAttempt ?? firstAttempt;
    const clientToSave = {
      ...attempt.clientToPersist,
      connectionProviderId: provider.id,
      workspaceId,
      redirectUri: this.getRedirectUrl(),
    };

    if (isDefined(storedClient) || !canReuseConcurrentRegistration) {
      await this.oauthClientService.saveClient(clientToSave);
    } else if (
      !(await this.oauthClientService.insertClientIfAbsent(clientToSave))
    ) {
      // Another member's first sign-in registered a client meanwhile: use it, so one client issues every token
      return this.prepareDiscoveredAuthorization({
        provider,
        workspaceId,
        canReuseConcurrentRegistration: false,
      });
    }

    return {
      authorizationUrl: attempt.authorizationUrl,
      codeVerifier: attempt.codeVerifier,
    };
  }

  // A server that forgot our client, or rejects our metadata document, would strand the user on its error page.
  // The replacement is kept only if accepted: other members' refresh tokens belong to the stored client.
  private async prepareReplacementIfRejected<
    TAttempt extends { authorizationUrl: URL },
  >({
    firstAttempt,
    fetchFn,
    prepareReplacement,
  }: {
    firstAttempt: TAttempt;
    fetchFn: FetchLike;
    prepareReplacement: () => Promise<TAttempt>;
  }): Promise<TAttempt | null> {
    if (
      !(await this.isClientRejected({
        authorizationUrl: firstAttempt.authorizationUrl,
        fetchFn,
      }))
    ) {
      return null;
    }

    try {
      const replacement = await prepareReplacement();

      return (await this.isClientRejected({
        authorizationUrl: replacement.authorizationUrl,
        fetchFn,
      }))
        ? null
        : replacement;
    } catch (error) {
      this.logger.warn(
        `Could not register a replacement OAuth client: ${error instanceof Error ? error.message : String(error)}`,
      );

      return null;
    }
  }

  async exchangeCode({
    provider,
    workspaceId,
    code,
    codeVerifier,
  }: {
    provider: ConnectionProviderEntity;
    workspaceId: string;
    code: string;
    codeVerifier: string | null;
  }): Promise<TokenExchangeResponse> {
    assertOAuthDiscoveryProvider(provider);

    if (!isDefined(codeVerifier)) {
      throw new ConnectionProviderException(
        'OAuth discovery state has no PKCE verifier',
        ConnectionProviderExceptionCode.INVALID_STATE,
      );
    }

    const storedClient = await this.findStoredClientOrThrow({
      provider,
      workspaceId,
    });
    const clientProvider = this.buildClientProvider({
      storedClient,
      codeVerifier,
      shouldReuseStoredDiscoveryState: true,
    });

    try {
      await auth(clientProvider, {
        serverUrl: provider.oauthDiscoveryConfig.resourceUrl,
        authorizationCode: code,
        fetchFn: this.buildFetch(workspaceId),
      });
    } catch (error) {
      throw this.toTokenExchangeError(error);
    } finally {
      if (clientProvider.isStoredClientInvalidated) {
        await this.oauthClientService.deleteClient({
          connectionProviderId: provider.id,
          workspaceId,
          clientId: storedClient.clientInformation.client_id,
        });
      }
    }

    if (!isDefined(clientProvider.savedTokens)) {
      throw new ConnectionProviderException(
        `OAuth discovery provider ${provider.id} returned no tokens`,
        ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED,
      );
    }

    return this.toTokenExchangeResponse(clientProvider.savedTokens);
  }

  async refreshTokens({
    provider,
    workspaceId,
    refreshToken,
  }: {
    provider: ConnectionProviderEntity;
    workspaceId: string;
    refreshToken: PlaintextString;
  }): Promise<TokenExchangeResponse> {
    assertOAuthDiscoveryProvider(provider);

    const storedClient = await this.findStoredClientOrThrow({
      provider,
      workspaceId,
    });
    const {
      authorizationServerUrl,
      authorizationServerMetadata,
      resourceMetadata,
    } = storedClient.discoveryState;

    try {
      const tokens = await refreshAuthorization(authorizationServerUrl, {
        metadata: authorizationServerMetadata,
        clientInformation: storedClient.clientInformation,
        refreshToken,
        resource: isDefined(resourceMetadata)
          ? new URL(resourceMetadata.resource)
          : undefined,
        fetchFn: this.buildFetch(workspaceId),
      });

      return this.toTokenExchangeResponse(tokens);
    } catch (error) {
      // The authorization server forgot the client: the next sign-in registers a new one.
      if (
        error instanceof InvalidClientError ||
        error instanceof UnauthorizedClientError
      ) {
        await this.oauthClientService.deleteClient({
          connectionProviderId: provider.id,
          workspaceId,
          clientId: storedClient.clientInformation.client_id,
        });
      }

      throw error;
    }
  }

  private async runAuthorizationRequest({
    provider,
    fetchFn,
    resourceMetadataUrl,
    scope,
    clientProvider,
  }: {
    provider: OAuthDiscoveryConnectionProvider;
    fetchFn: FetchLike;
    resourceMetadataUrl: URL | undefined;
    scope: string | undefined;
    clientProvider: OAuthDiscoveryClientProvider;
  }) {
    try {
      await auth(clientProvider, {
        serverUrl: provider.oauthDiscoveryConfig.resourceUrl,
        resourceMetadataUrl,
        scope,
        fetchFn,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.warn(
        `OAuth discovery for connection provider ${provider.id} failed: ${message}`,
      );

      throw new ConnectionProviderException(
        `OAuth discovery for connection provider ${provider.id} failed: ${message}`,
        ConnectionProviderExceptionCode.INVALID_REQUEST,
      );
    }

    const clientToPersist = clientProvider.getClientToPersist();

    if (
      !isDefined(clientProvider.authorizationUrl) ||
      !isDefined(clientProvider.savedCodeVerifier) ||
      !isDefined(clientToPersist)
    ) {
      throw new ConnectionProviderException(
        `Connection provider ${provider.id} did not start an authorization code flow`,
        ConnectionProviderExceptionCode.INVALID_REQUEST,
      );
    }

    return {
      clientToPersist,
      authorizationUrl: clientProvider.authorizationUrl,
      codeVerifier: clientProvider.savedCodeVerifier,
    };
  }

  // The resource's 401 names its metadata and the scope it wants; servers that only publish well-known metadata skip this.
  // Without a browser session the server answers with its login page, unless it does not know the client.
  private async isClientRejected({
    authorizationUrl,
    fetchFn,
  }: {
    authorizationUrl: URL;
    fetchFn: FetchLike;
  }): Promise<boolean> {
    try {
      const response = await fetchFn(authorizationUrl, {
        method: 'GET',
        redirect: 'manual',
      });

      await response.body?.cancel().catch(() => undefined);

      return response.status === 400 || response.status === 401;
    } catch {
      return false;
    }
  }

  private async findStoredClientOrThrow({
    provider,
    workspaceId,
  }: ProviderContext): Promise<OAuthDiscoveryStoredClient> {
    const storedClient = await this.oauthClientService.findStoredClient({
      connectionProviderId: provider.id,
      workspaceId,
    });

    if (!isDefined(storedClient)) {
      throw new ConnectionProviderException(
        `Connection provider ${provider.id} has no OAuth client yet: sign in again`,
        ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED,
      );
    }

    return storedClient;
  }

  private toTokenExchangeError(error: unknown): ConnectionProviderException {
    const message = error instanceof Error ? error.message : String(error);

    return new ConnectionProviderException(
      message,
      ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED,
    );
  }

  private toTokenExchangeResponse(tokens: OAuthTokens): TokenExchangeResponse {
    const accessToken = tokens.access_token as PlaintextString;

    return {
      accessToken,
      refreshToken: (tokens.refresh_token ?? null) as PlaintextString | null,
      idToken: (tokens.id_token ?? null) as PlaintextString | null,
      scopes: isDefined(tokens.scope) ? tokens.scope.split(' ') : null,
      accessTokenExpiresAt: parseAccessTokenExpiresAt(
        tokens.expires_in,
        accessToken,
      ),
    };
  }

  private buildClientProvider({
    storedClient,
    codeVerifier,
    shouldReuseStoredDiscoveryState,
    isClientIdMetadataDocumentAllowed = true,
  }: {
    storedClient: OAuthDiscoveryStoredClient | null;
    codeVerifier?: string;
    shouldReuseStoredDiscoveryState: boolean;
    isClientIdMetadataDocumentAllowed?: boolean;
  }): OAuthDiscoveryClientProvider {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');
    const clientMetadataUrl = buildOAuthDiscoveryClientMetadataUrl(serverUrl);

    return new OAuthDiscoveryClientProvider({
      redirectUrl: this.getRedirectUrl(),
      // An authorization server only fetches a metadata document over HTTPS.
      clientMetadataUrl:
        isClientIdMetadataDocumentAllowed && isHttpsUrl(clientMetadataUrl)
          ? clientMetadataUrl
          : undefined,
      clientMetadata: buildOAuthDiscoveryClientMetadata(serverUrl),
      storedClient,
      codeVerifier,
      shouldReuseStoredDiscoveryState,
      now: new Date(),
    });
  }

  private buildFetch(workspaceId: string): FetchLike {
    return this.secureHttpClientService.createFetchLike({
      context: { workspaceId, source: 'connection-provider' },
      timeoutMs: OAUTH_DISCOVERY_REQUEST_TIMEOUT_MS,
    });
  }

  private getRedirectUrl(): string {
    return buildAppOAuthCallbackUrl(this.twentyConfigService.get('SERVER_URL'));
  }
}
