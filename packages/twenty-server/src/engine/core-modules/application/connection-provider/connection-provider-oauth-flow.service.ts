import { Injectable, Logger } from '@nestjs/common';

import { ConnectionProviderAuthorizationStateService } from 'src/engine/core-modules/application/connection-provider/connection-provider-authorization-state.service';
import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { type ConnectionAuthorizationArgs } from 'src/engine/core-modules/application/connection-provider/types/connection-authorization-args.type';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { assertOAuthProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-provider.util';
import { buildAppOAuthCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-callback-url.util';
import { computePkceChallenge } from 'src/engine/core-modules/application/connection-provider/utils/compute-pkce-challenge.util';
import { exchangeCodeForToken } from 'src/engine/core-modules/application/connection-provider/utils/exchange-code-for-token.util';
import { generatePkceVerifier } from 'src/engine/core-modules/application/connection-provider/utils/generate-pkce-verifier.util';
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
  ) {}

  async startAuthorizationFlow(
    authorizationArgs: ConnectionAuthorizationArgs,
  ): Promise<{ authorizationUrl: string }> {
    const { connectionProvider, workspaceId, userWorkspaceId } =
      authorizationArgs;

    assertOAuthProvider(connectionProvider);

    await this.connectedAccountService.assertCallerCanConnectOrThrow({
      connectionProviderId: connectionProvider.id,
      workspaceId,
      userWorkspaceId,
      scope: connectionProvider.scope,
      reconnectingConnectedAccountId:
        authorizationArgs.reconnectingConnectedAccountId,
    });

    const { clientId } =
      await this.oauthProviderService.getClientCredentials(connectionProvider);

    const { authorizationEndpoint, scopes, authorizationParams, usePkce } =
      connectionProvider.oauthConfig;

    const codeVerifier = usePkce ? generatePkceVerifier() : null;

    const state = await this.authorizationStateService.sign({
      ...authorizationArgs,
      codeVerifier,
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

    assertOAuthProvider(provider);

    await this.connectedAccountService.assertCallerCanConnectOrThrow({
      connectionProviderId: provider.id,
      workspaceId: statePayload.workspaceId,
      userWorkspaceId: statePayload.userWorkspaceId,
      scope: statePayload.scope,
      reconnectingConnectedAccountId:
        statePayload.reconnectingConnectedAccountId,
    });

    const { clientId, clientSecret } =
      await this.oauthProviderService.getClientCredentials(provider);

    const callbackUrl = buildAppOAuthCallbackUrl(this.getServerUrl());

    let tokenResponse: TokenExchangeResponse;

    try {
      tokenResponse = await exchangeCodeForToken({
        fetchFn: this.secureHttpClientService.createSsrfSafeFetch(),
        tokenEndpoint: provider.oauthConfig.tokenEndpoint,
        clientId,
        clientSecret,
        code: callbackArgs.code,
        redirectUri: callbackUrl,
        codeVerifier: statePayload.codeVerifier,
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
        scopes: tokenResponse.scopes ?? provider.oauthConfig.scopes,
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

  private getServerUrl(): string {
    return this.twentyConfigService.get('SERVER_URL');
  }
}
