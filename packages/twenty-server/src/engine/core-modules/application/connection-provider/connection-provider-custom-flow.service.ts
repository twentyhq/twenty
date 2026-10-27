import { Injectable } from '@nestjs/common';

import { type ConnectionCallbackPayload } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderAuthorizationStateService } from 'src/engine/core-modules/application/connection-provider/connection-provider-authorization-state.service';
import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { type ConnectionAuthorizationArgs } from 'src/engine/core-modules/application/connection-provider/types/connection-authorization-args.type';
import { assertCustomProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-custom-provider.util';
import { wasStateIssuedBeforeAccountChange } from 'src/engine/core-modules/application/connection-provider/utils/was-state-issued-before-account-change.util';
import { buildAppCustomConnectionCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-custom-connection-callback-url.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
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
    private readonly cacheLockService: CacheLockService,
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
      codeVerifier: null,
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

    const { externalAccountId, handle, accessToken } =
      connectedAccountFromCallback;

    const { connectedAccount, isRepeatReport } =
      await this.cacheLockService.withLock(async () => {
        const existingConnectedAccount =
          await this.connectedAccountService.findConnectedAccountForReport({
            provider,
            workspaceId: statePayload.workspaceId,
            userWorkspaceId: statePayload.userWorkspaceId,
            externalAccountId,
            reconnectingConnectedAccountId:
              statePayload.reconnectingConnectedAccountId,
          });

        if (
          isDefined(existingConnectedAccount) &&
          wasStateIssuedBeforeAccountChange({
            stateIssuedAtSeconds: statePayload.iat,
            connectedAccount: existingConnectedAccount,
          })
        ) {
          return { connectedAccount: null, isRepeatReport: true };
        }

        return {
          isRepeatReport:
            !isDefined(statePayload.reconnectingConnectedAccountId) &&
            isDefined(existingConnectedAccount) &&
            !isDefined(existingConnectedAccount.archivedAt) &&
            !isDefined(existingConnectedAccount.authFailedAt),
          connectedAccount: await this.connectedAccountService.persist({
            provider,
            credentials: isDefined(accessToken)
              ? { accessToken, refreshToken: null, scopes: null }
              : undefined,
            handle,
            identifiedAccount: { externalAccountId },
            workspaceId: statePayload.workspaceId,
            userId: statePayload.userId,
            userWorkspaceId: statePayload.userWorkspaceId,
            scope: statePayload.scope,
            reconnectingConnectedAccountId:
              statePayload.reconnectingConnectedAccountId ??
              existingConnectedAccount?.id ??
              null,
          }),
        };
      }, `app-custom-connection:${statePayload.workspaceId}:${provider.id}:${statePayload.userWorkspaceId}:${externalAccountId}`);

    if (!isDefined(connectedAccount)) {
      return { ...callbackResult, connectedAccountId: null };
    }

    if (!isRepeatReport) {
      await this.connectionProviderLifecycleHookService.dispatchOnConnect({
        provider,
        workspaceId: statePayload.workspaceId,
        connectedAccountId: connectedAccount.id,
      });
    }

    return { ...callbackResult, connectedAccountId: connectedAccount.id };
  }
}
