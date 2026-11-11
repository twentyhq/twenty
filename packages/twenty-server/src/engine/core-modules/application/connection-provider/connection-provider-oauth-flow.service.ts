import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderAuthorizationStateService } from 'src/engine/core-modules/application/connection-provider/connection-provider-authorization-state.service';
import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { ConnectionProviderOAuthDiscoveryTokenService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-discovery-token.service';
import { ConnectionProviderOAuthDiscoveryService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-discovery.service';
import { type ConnectionAuthorizationArgs } from 'src/engine/core-modules/application/connection-provider/types/connection-authorization-args.type';
import { type ConnectionProviderFlowSecrets } from 'src/engine/core-modules/application/connection-provider/types/connection-provider-flow-secrets.type';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { assertOAuthDiscoveryProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-discovery-provider.util';
import { assertOAuthProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import { buildAppOAuthCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-callback-url.util';
import { computePkceChallenge } from 'src/engine/core-modules/application/connection-provider/utils/compute-pkce-challenge.util';
import { exchangeCodeForToken } from 'src/engine/core-modules/application/connection-provider/utils/exchange-code-for-token.util';
import { generatePkceVerifier } from 'src/engine/core-modules/application/connection-provider/utils/generate-pkce-verifier.util';
import { type AppOAuthStateJwtPayload } from 'src/engine/core-modules/auth/types/app-oauth-state-jwt-payload.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const STATE_JWT_EXPIRES_IN = '10m';

type CallbackArgs = {
  code: string;
  state: string;
};

type CallbackResult = {
  connectedAccountId: string;
  workspaceId: string;
  applicationId: string;
  redirectLocation: string | null;
};

@Injectable()
export class ConnectionProviderOAuthFlowService {
  private readonly logger = new Logger(ConnectionProviderOAuthFlowService.name);

  constructor(
    private readonly oauthProviderService: ConnectionProviderService,
    private readonly authorizationStateService: ConnectionProviderAuthorizationStateService,
    private readonly connectedAccountService: ConnectionProviderConnectedAccountService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly connectionProviderLifecycleHookService: ConnectionProviderLifecycleHookService,
    private readonly oauthDiscoveryService: ConnectionProviderOAuthDiscoveryService,
    private readonly oauthDiscoveryTokenService: ConnectionProviderOAuthDiscoveryTokenService,
  ) {}

  async startAuthorizationFlow(
    authorizationArgs: ConnectionAuthorizationArgs,
  ): Promise<{ authorizationUrl: string }> {
    const { connectionProvider, workspaceId, userWorkspaceId } =
      authorizationArgs;

    await this.connectedAccountService.assertCallerCanConnectOrThrow({
      connectionProviderId: connectionProvider.id,
      workspaceId,
      userWorkspaceId,
      scope: connectionProvider.scope,
      reconnectingConnectedAccountId:
        authorizationArgs.reconnectingConnectedAccountId,
    });

    if (connectionProvider.type === 'oauth-discovery') {
      return this.startOAuthDiscoveryAuthorizationFlow(authorizationArgs);
    }

    assertOAuthProvider(connectionProvider);

    const { clientId } =
      await this.oauthProviderService.getClientCredentials(connectionProvider);

    const { authorizationEndpoint, scopes, authorizationParams, usePkce } =
      connectionProvider.oauthConfig;

    const codeVerifier = usePkce ? generatePkceVerifier() : null;

    const state = await this.authorizationStateService.sign({
      ...authorizationArgs,
      flowSecrets: isDefined(codeVerifier)
        ? { codeVerifier, oauthClientId: null }
        : null,
      expiresIn: STATE_JWT_EXPIRES_IN,
    });

    const callbackUrl = buildAppOAuthCallbackUrl(this.getServerUrl());

    const authorizationUrl = new URL(authorizationEndpoint);

    authorizationUrl.searchParams.set('client_id', clientId);
    authorizationUrl.searchParams.set('redirect_uri', callbackUrl);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('scope', scopes.join(' '));
    authorizationUrl.searchParams.set('state', state);

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

    return { authorizationUrl: authorizationUrl.toString() };
  }

  private async startOAuthDiscoveryAuthorizationFlow(
    authorizationArgs: ConnectionAuthorizationArgs,
  ): Promise<{ authorizationUrl: string }> {
    const { connectionProvider, workspaceId } = authorizationArgs;

    assertOAuthDiscoveryProvider(connectionProvider);

    const { authorizationUrl, codeVerifier, clientId } =
      await this.oauthDiscoveryService.prepareAuthorization({
        provider: connectionProvider,
        workspaceId,
      });

    const state = await this.authorizationStateService.sign({
      ...authorizationArgs,
      flowSecrets: { codeVerifier, oauthClientId: clientId },
      expiresIn: STATE_JWT_EXPIRES_IN,
    });

    authorizationUrl.searchParams.set('state', state);

    return { authorizationUrl: authorizationUrl.toString() };
  }

  async completeAuthorizationFlow(
    callbackArgs: CallbackArgs,
  ): Promise<CallbackResult> {
    const statePayload = await this.authorizationStateService.verifyOrThrow(
      callbackArgs.state,
    );

    const provider = await this.oauthProviderService.findOneByIdOrThrow({
      id: statePayload.connectionProviderId,
      workspaceId: statePayload.workspaceId,
    });

    await this.connectedAccountService.assertCallerCanConnectOrThrow({
      connectionProviderId: provider.id,
      workspaceId: statePayload.workspaceId,
      userWorkspaceId: statePayload.userWorkspaceId,
      scope: statePayload.scope,
      reconnectingConnectedAccountId:
        statePayload.reconnectingConnectedAccountId,
    });

    const tokenResponse = await this.exchangeCodeForTokens({
      provider,
      workspaceId: statePayload.workspaceId,
      code: callbackArgs.code,
      flowSecrets: await this.resolveFlowSecrets(statePayload),
    });

    const identifiedAccount =
      await this.connectionProviderLifecycleHookService.runIdentifyAccount({
        provider,
        workspaceId: statePayload.workspaceId,
        accessToken: tokenResponse.accessToken,
      });

    const handle =
      identifiedAccount?.handle ??
      (await this.connectedAccountService.resolveHandle({
        idToken: tokenResponse.idToken,
        userId: statePayload.userId,
      }));

    const connectedAccount = await this.connectedAccountService.persist({
      provider,
      credentials: {
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        scopes: tokenResponse.scopes ?? provider.oauthConfig?.scopes ?? null,
        accessTokenExpiresAt: tokenResponse.accessTokenExpiresAt,
      },
      handle,
      identifiedAccount,
      workspaceId: statePayload.workspaceId,
      userId: statePayload.userId,
      userWorkspaceId: statePayload.userWorkspaceId,
      scope: statePayload.scope,
      reconnectingConnectedAccountId:
        statePayload.reconnectingConnectedAccountId,
    });

    await this.connectionProviderLifecycleHookService.dispatchOnConnect({
      provider,
      workspaceId: statePayload.workspaceId,
      connectedAccountId: connectedAccount.id,
    });

    return {
      connectedAccountId: connectedAccount.id,
      workspaceId: statePayload.workspaceId,
      applicationId: provider.applicationId,
      redirectLocation: statePayload.redirectLocation,
    };
  }

  private async exchangeCodeForTokens({
    provider,
    workspaceId,
    code,
    flowSecrets,
  }: {
    provider: ConnectionProviderEntity;
    workspaceId: string;
    code: string;
    flowSecrets: ConnectionProviderFlowSecrets | null;
  }): Promise<TokenExchangeResponse> {
    if (provider.type === 'oauth-discovery') {
      assertOAuthDiscoveryProvider(provider);

      if (!isDefined(flowSecrets?.oauthClientId)) {
        throw new ConnectionProviderException(
          'OAuth discovery state has no PKCE verifier or client',
          ConnectionProviderExceptionCode.INVALID_STATE,
        );
      }

      return this.oauthDiscoveryTokenService.exchangeCode({
        provider,
        workspaceId,
        code,
        codeVerifier: flowSecrets.codeVerifier,
        clientId: flowSecrets.oauthClientId,
      });
    }

    assertOAuthProvider(provider);

    const { clientId, clientSecret } =
      await this.oauthProviderService.getClientCredentials(provider);

    try {
      return await exchangeCodeForToken({
        fetchFn: this.secureHttpClientService.createSsrfSafeFetch(),
        tokenEndpoint: provider.oauthConfig.tokenEndpoint,
        clientId,
        clientSecret,
        code,
        redirectUri: buildAppOAuthCallbackUrl(this.getServerUrl()),
        codeVerifier: flowSecrets?.codeVerifier ?? null,
        contentType: provider.oauthConfig.tokenRequestContentType,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `OAuth token exchange failed for provider ${provider.id}: ${message}`,
      );

      throw new ConnectionProviderException(
        message,
        ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED,
      );
    }
  }

  private async resolveFlowSecrets(
    statePayload: AppOAuthStateJwtPayload,
  ): Promise<ConnectionProviderFlowSecrets | null> {
    if (isDefined(statePayload.flowSecretId)) {
      return this.authorizationStateService.consumeFlowSecretsOrThrow(
        statePayload.flowSecretId,
      );
    }

    if (isDefined(statePayload.codeVerifier)) {
      return { codeVerifier: statePayload.codeVerifier, oauthClientId: null };
    }

    return null;
  }

  private getServerUrl(): string {
    return this.twentyConfigService.get('SERVER_URL');
  }
}
