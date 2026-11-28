import { Injectable } from '@nestjs/common';

import { type ConnectionCallbackPayload } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderAuthorizationStateService } from 'src/engine/core-modules/application/connection-provider/connection-provider-authorization-state.service';
import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderReportedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-reported-account.service';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { type ConnectionAuthorizationArgs } from 'src/engine/core-modules/application/connection-provider/types/connection-authorization-args.type';
import { assertCustomProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-custom-provider.util';
import { buildAppCustomConnectionCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-custom-connection-callback-url.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const STATE_JWT_EXPIRES_IN = '1h';

type CallbackArgs = {
  state: string;
  request: Pick<
    ConnectionCallbackPayload,
    'httpMethod' | 'queryStringParameters' | 'headers' | 'body' | 'rawBody'
  >;
};

type CallbackResult = {
  connectedAccountId: string | null;
  workspaceId: string;
  applicationId: string;
  redirectLocation: string | null;
};

@Injectable()
export class ConnectionProviderCustomFlowService {
  constructor(
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly authorizationStateService: ConnectionProviderAuthorizationStateService,
    private readonly connectedAccountService: ConnectionProviderConnectedAccountService,
    private readonly connectionProviderLifecycleHookService: ConnectionProviderLifecycleHookService,
    private readonly reportedAccountService: ConnectionProviderReportedAccountService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async startAuthorizationFlow(
    authorizationArgs: ConnectionAuthorizationArgs,
  ): Promise<{ authorizationUrl: string }> {
    const { connectionProvider, workspaceId, userWorkspaceId } =
      authorizationArgs;

    assertCustomProvider(connectionProvider);

    await this.connectedAccountService.assertCallerCanConnectOrThrow({
      connectionProviderId: connectionProvider.id,
      workspaceId,
      userWorkspaceId,
      scope: connectionProvider.scope,
      reconnectingConnectedAccountId:
        authorizationArgs.reconnectingConnectedAccountId,
    });

    const state = await this.authorizationStateService.sign({
      ...authorizationArgs,
      flowSecrets: null,
      expiresIn: STATE_JWT_EXPIRES_IN,
    });

    const authorizationUrl =
      await this.connectionProviderLifecycleHookService.runAuthorize({
        provider: connectionProvider,
        workspaceId,
        callbackUrl: buildAppCustomConnectionCallbackUrl({
          serverUrl: this.twentyConfigService.get('SERVER_URL'),
          state,
        }),
      });

    return { authorizationUrl };
  }

  async completeAuthorizationFlow(
    callbackArgs: CallbackArgs,
  ): Promise<CallbackResult> {
    const statePayload = await this.authorizationStateService.verifyOrThrow(
      callbackArgs.state,
    );

    const provider = await this.connectionProviderService.findOneByIdOrThrow({
      id: statePayload.connectionProviderId,
      workspaceId: statePayload.workspaceId,
    });

    assertCustomProvider(provider);

    await this.connectedAccountService.assertCallerCanConnectOrThrow({
      connectionProviderId: provider.id,
      workspaceId: statePayload.workspaceId,
      userWorkspaceId: statePayload.userWorkspaceId,
      scope: statePayload.scope,
      reconnectingConnectedAccountId:
        statePayload.reconnectingConnectedAccountId,
    });

    const callbackResult = {
      workspaceId: statePayload.workspaceId,
      applicationId: provider.applicationId,
      redirectLocation: statePayload.redirectLocation,
    };

    const connectedAccountFromCallback =
      await this.connectionProviderLifecycleHookService.runCallback({
        provider,
        workspaceId: statePayload.workspaceId,
        request: callbackArgs.request,
      });

    if (!isDefined(connectedAccountFromCallback)) {
      return { ...callbackResult, connectedAccountId: null };
    }

    const connectedAccountId =
      await this.reportedAccountService.persistReportedAccount({
        provider,
        workspaceId: statePayload.workspaceId,
        userId: statePayload.userId,
        userWorkspaceId: statePayload.userWorkspaceId,
        scope: statePayload.scope,
        reconnectingConnectedAccountId:
          statePayload.reconnectingConnectedAccountId,
        authorizationIssuedAtSeconds: statePayload.iat,
        reportedAccount: connectedAccountFromCallback,
      });

    return { ...callbackResult, connectedAccountId };
  }
}
