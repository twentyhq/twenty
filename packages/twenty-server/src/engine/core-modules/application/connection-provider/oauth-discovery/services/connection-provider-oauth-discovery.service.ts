import { Injectable, Logger } from '@nestjs/common';

import { auth } from '@modelcontextprotocol/sdk/client/auth.js';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { OAUTH_DISCOVERY_REQUEST_TIMEOUT_MS } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/constants/oauth-discovery-request-timeout-ms.constant';
import { ConnectionProviderOAuthClientService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-client.service';
import { type OAuthDiscoveryStoredClient } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-stored-client.type';
import { buildOAuthDiscoveryClientProvider } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/build-oauth-discovery-client-provider.util';
import { isOAuthClientRejected } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/is-oauth-client-rejected.util';
import { type OAuthDiscoveryClientProvider } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/oauth-discovery-client-provider';
import { probeProtectedResource } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/probe-protected-resource.util';
import { type OAuthDiscoveryConnectionProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-discovery-provider.util';
import { buildAppOAuthCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-callback-url.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { buildSecureFetchLike } from 'src/engine/core-modules/secure-http-client/utils/build-secure-fetch-like.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type ProviderContext = {
  provider: OAuthDiscoveryConnectionProvider;
  workspaceId: string;
};

// Runs the MCP authorization flow for a protected resource: RFC 9728 discovery,
// a Client ID Metadata Document or dynamic registration, PKCE and resource indicators.
@Injectable()
export class ConnectionProviderOAuthDiscoveryService {
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
    canReuseConcurrentRegistration = true,
  }: ProviderContext & {
    canReuseConcurrentRegistration?: boolean;
  }): Promise<{
    authorizationUrl: URL;
    codeVerifier: string;
    clientId: string;
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
        clientProvider: buildOAuthDiscoveryClientProvider({
          serverUrl: this.twentyConfigService.get('SERVER_URL'),
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
      redirectUri: buildAppOAuthCallbackUrl(
        this.twentyConfigService.get('SERVER_URL'),
      ),
    };

    if (isDefined(storedClient) || !canReuseConcurrentRegistration) {
      await this.oauthClientService.saveClient(clientToSave);
    } else if (
      !(await this.oauthClientService.insertClientIfAbsent(clientToSave))
    ) {
      // Another member's first sign-in registered a client meanwhile: use it, so one client issues every token
      return this.prepareAuthorization({
        provider,
        workspaceId,
        canReuseConcurrentRegistration: false,
      });
    }

    return {
      authorizationUrl: attempt.authorizationUrl,
      codeVerifier: attempt.codeVerifier,
      clientId: clientToSave.clientInformation.client_id,
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
      !(await isOAuthClientRejected({
        authorizationUrl: firstAttempt.authorizationUrl,
        fetchFn,
      }))
    ) {
      return null;
    }

    try {
      const replacement = await prepareReplacement();

      return (await isOAuthClientRejected({
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

  private buildFetch(workspaceId: string): FetchLike {
    return buildSecureFetchLike({
      secureHttpClientService: this.secureHttpClientService,
      context: { workspaceId, source: 'connection-provider' },
      timeoutMs: OAUTH_DISCOVERY_REQUEST_TIMEOUT_MS,
    });
  }
}
