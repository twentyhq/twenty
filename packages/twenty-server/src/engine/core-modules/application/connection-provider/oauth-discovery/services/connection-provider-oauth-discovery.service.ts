import { Injectable, Logger } from '@nestjs/common';

import { auth } from '@modelcontextprotocol/sdk/client/auth.js';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { OAUTH_DISCOVERY_REQUEST_TIMEOUT_MS } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/constants/oauth-discovery-request-timeout-ms.constant';
import { ConnectionProviderOAuthClientService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-client.service';
import { type OAuthDiscoveryProviderContext } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-provider-context.type';
import { type OAuthDiscoveryStoredClient } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-stored-client.type';
import { buildOAuthDiscoveryClientProvider } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/build-oauth-discovery-client-provider.util';
import { isOAuthClientRejected } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/is-oauth-client-rejected.util';
import { type OAuthDiscoveryClientProvider } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/oauth-discovery-client-provider';
import {
  probeProtectedResource,
  type ProtectedResourceProbe,
} from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/probe-protected-resource.util';
import { type OAuthDiscoveryConnectionProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-discovery-provider.util';
import { buildAppOAuthCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-callback-url.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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
  }: OAuthDiscoveryProviderContext & {
    canReuseConcurrentRegistration?: boolean;
  }): Promise<{
    authorizationUrl: URL;
    codeVerifier: string;
    clientId: string;
  }> {
    const fetchFn = this.buildFetch(workspaceId);
    const { resourceMetadataUrl, scope } = await this.probeResource({
      provider,
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
      connectionProviderId: provider.id,
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

    // Another member's sign-in registered or replaced the client meanwhile: use theirs, so one client issues every token
    const isClientSaved = isDefined(storedClient)
      ? await this.oauthClientService.replaceClientIfUnchanged({
          client: clientToSave,
          expectedClientId: storedClient.clientInformation.client_id,
        })
      : await this.oauthClientService.insertClientIfAbsent(clientToSave);

    if (!isClientSaved) {
      if (!canReuseConcurrentRegistration) {
        throw new ConnectionProviderException(
          `OAuth client of connection provider ${provider.id} keeps changing: sign in again`,
          ConnectionProviderExceptionCode.INVALID_REQUEST,
        );
      }

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

  // A replacement client is kept only if the server accepts it: other members' refresh tokens belong to the stored one.
  private async prepareReplacementIfRejected<
    TAttempt extends { authorizationUrl: URL },
  >({
    connectionProviderId,
    firstAttempt,
    fetchFn,
    prepareReplacement,
  }: {
    connectionProviderId: string;
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
        `Could not register a replacement OAuth client for connection provider ${connectionProviderId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return null;
    }
  }

  private async probeResource({
    provider,
    fetchFn,
  }: {
    provider: OAuthDiscoveryConnectionProvider;
    fetchFn: FetchLike;
  }): Promise<ProtectedResourceProbe> {
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
    return this.secureHttpClientService.createFetchLike({
      context: { workspaceId, source: 'connection-provider' },
      timeoutMs: OAUTH_DISCOVERY_REQUEST_TIMEOUT_MS,
    });
  }
}
