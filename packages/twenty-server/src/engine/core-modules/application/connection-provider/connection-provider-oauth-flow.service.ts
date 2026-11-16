import { Injectable, Logger } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ConnectionProviderAuthorizationStateService } from 'src/engine/core-modules/application/connection-provider/connection-provider-authorization-state.service';
import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderOAuthClientService } from 'src/engine/core-modules/application/connection-provider/oauth-client/connection-provider-oauth-client.service';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type ConnectionAuthorizationArgs } from 'src/engine/core-modules/application/connection-provider/types/connection-authorization-args.type';
import { type ResolvedOAuthClient } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { type ConnectionProviderFlowSecrets } from 'src/engine/core-modules/application/connection-provider/types/connection-provider-flow-secrets.type';
import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
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
  browserNonces: string[];
};

type AuthorizationStartArgs = ConnectionAuthorizationArgs & {
  browserNonce: string;
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
    private readonly oauthClientService: ConnectionProviderOAuthClientService,
    private readonly authorizationStateService: ConnectionProviderAuthorizationStateService,
    private readonly connectedAccountService: ConnectionProviderConnectedAccountService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly connectionProviderLifecycleHookService: ConnectionProviderLifecycleHookService,
  ) {}

  async startAuthorizationFlow({
    browserNonce,
    ...authorizationArgs
  }: AuthorizationStartArgs): Promise<{ authorizationUrl: string }> {
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

    const client = await this.oauthClientService.resolveForAuthorization({
      provider: connectionProvider,
      workspaceId,
    });
    const codeVerifier = client.shouldUsePkce ? generatePkceVerifier() : null;

    const state = await this.authorizationStateService.sign({
      ...authorizationArgs,
      flowSecrets: {
        codeVerifier,
        tokenEndpoint: client.tokenEndpoint,
        clientId: client.clientId,
        scopes: client.scopes,
        browserNonce,
      },
      expiresIn: STATE_JWT_EXPIRES_IN,
    });

    const authorizationUrl = new URL(client.authorizationEndpoint);

    authorizationUrl.searchParams.set('client_id', client.clientId);
    authorizationUrl.searchParams.set(
      'redirect_uri',
      buildAppOAuthCallbackUrl(this.getServerUrl()),
    );
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('state', state);

    if (isNonEmptyArray(client.scopes)) {
      authorizationUrl.searchParams.set('scope', client.scopes.join(' '));
    }

    if (isDefined(client.resource)) {
      authorizationUrl.searchParams.set('resource', client.resource);
    }

    if (isDefined(codeVerifier)) {
      authorizationUrl.searchParams.set(
        'code_challenge',
        computePkceChallenge(codeVerifier),
      );
      authorizationUrl.searchParams.set('code_challenge_method', 'S256');
    }

    for (const [key, value] of Object.entries(
      client.authorizationParams ?? {},
    )) {
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

    await this.connectedAccountService.assertCallerCanConnectOrThrow({
      connectionProviderId: provider.id,
      workspaceId: statePayload.workspaceId,
      userWorkspaceId: statePayload.userWorkspaceId,
      scope: statePayload.scope,
      reconnectingConnectedAccountId:
        statePayload.reconnectingConnectedAccountId,
    });

    const flowSecrets = await this.consumeFlowSecretsOrThrow({
      statePayload,
      browserNonces: callbackArgs.browserNonces,
    });
    const client = await this.oauthClientService.resolveForTokenRequest({
      provider,
      workspaceId: statePayload.workspaceId,
    });

    if (
      client.clientId !== flowSecrets.clientId ||
      client.tokenEndpoint !== flowSecrets.tokenEndpoint
    ) {
      throw new ConnectionProviderException(
        `OAuth client of connection provider ${provider.id} changed during sign-in: sign in again`,
        ConnectionProviderExceptionCode.INVALID_STATE,
      );
    }

    const tokenResponse = await this.exchangeCodeForTokens({
      provider,
      workspaceId: statePayload.workspaceId,
      client,
      code: callbackArgs.code,
      codeVerifier: flowSecrets.codeVerifier,
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
        scopes: tokenResponse.scopes ?? flowSecrets.scopes,
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
    client,
    code,
    codeVerifier,
  }: {
    provider: ConnectionProviderEntity;
    workspaceId: string;
    client: ResolvedOAuthClient;
    code: string;
    codeVerifier: string | null;
  }): Promise<TokenExchangeResponse> {
    try {
      return await exchangeCodeForToken({
        fetchFn: this.secureHttpClientService.createSsrfSafeFetch(),
        client,
        code,
        redirectUri: buildAppOAuthCallbackUrl(this.getServerUrl()),
        codeVerifier,
      });
    } catch (error) {
      await this.oauthClientService.forgetClientIfRejected({
        provider,
        workspaceId,
        client,
        error,
      });

      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `OAuth token exchange failed for provider ${provider.id} in workspace ${workspaceId}: ${message}`,
      );

      throw new ConnectionProviderException(
        message,
        ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED,
      );
    }
  }

  private async consumeFlowSecretsOrThrow({
    statePayload,
    browserNonces,
  }: {
    statePayload: Pick<AppOAuthStateJwtPayload, 'flowSecretId'>;
    browserNonces: string[];
  }): Promise<ConnectionProviderFlowSecrets> {
    if (!isDefined(statePayload.flowSecretId)) {
      throw new ConnectionProviderException(
        'OAuth state has no flow secrets',
        ConnectionProviderExceptionCode.INVALID_STATE,
      );
    }

    const flowSecrets =
      await this.authorizationStateService.consumeFlowSecretsOrThrow(
        statePayload.flowSecretId,
      );

    if (!browserNonces.includes(flowSecrets.browserNonce)) {
      throw new ConnectionProviderException(
        'OAuth sign-in must finish in the browser that started it',
        ConnectionProviderExceptionCode.INVALID_STATE,
      );
    }

    return flowSecrets;
  }

  private getServerUrl(): string {
    return this.twentyConfigService.get('SERVER_URL');
  }
}
