import { Injectable } from '@nestjs/common';

import { ConnectionProviderAuthorizationStateService } from 'src/engine/core-modules/application/connection-provider/connection-provider-authorization-state.service';
import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderOAuthGrantService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-grant.service';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { type ConnectionAuthorizationArgs } from 'src/engine/core-modules/application/connection-provider/types/connection-authorization-args.type';

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
  constructor(
    private readonly oauthProviderService: ConnectionProviderService,
    private readonly authorizationStateService: ConnectionProviderAuthorizationStateService,
    private readonly connectedAccountService: ConnectionProviderConnectedAccountService,
    private readonly connectionProviderLifecycleHookService: ConnectionProviderLifecycleHookService,
    private readonly oauthGrantService: ConnectionProviderOAuthGrantService,
  ) {}

  async startAuthorizationFlow(
    authorizationArgs: ConnectionAuthorizationArgs,
  ): Promise<{ authorizationUrl: string }> {
    const { connectionProvider, workspaceId, userWorkspaceId } =
      authorizationArgs;
    const oauthGrant = this.oauthGrantService.getOrThrow(connectionProvider);

    await this.connectedAccountService.assertCallerCanConnectOrThrow({
      connectionProviderId: connectionProvider.id,
      workspaceId,
      userWorkspaceId,
      scope: connectionProvider.scope,
      reconnectingConnectedAccountId:
        authorizationArgs.reconnectingConnectedAccountId,
    });

    const { authorizationUrl, codeVerifier } =
      await oauthGrant.prepareAuthorization({
        provider: connectionProvider,
        workspaceId,
      });

    const state = await this.authorizationStateService.sign({
      ...authorizationArgs,
      codeVerifier,
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

    const tokenResponse = await this.oauthGrantService
      .getOrThrow(provider)
      .exchangeCode({
        provider,
        workspaceId: statePayload.workspaceId,
        code: callbackArgs.code,
        codeVerifier: statePayload.codeVerifier,
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
}
