import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ConnectionCallbackPayload } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ConnectionProviderAuthorizationStateService } from 'src/engine/core-modules/application/connection-provider/connection-provider-authorization-state.service';
import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { type ConnectionAuthorizationArgs } from 'src/engine/core-modules/application/connection-provider/types/connection-authorization-args.type';
import { assertCustomProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-custom-provider.util';
import { buildAppCustomConnectionCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-custom-connection-callback-url.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// hosted logins can involve 2FA or checkpoints, and the account then arrives by notification
const STATE_JWT_EXPIRES_IN = '1h';

type CallbackArgs = {
  state: string;
  request: Pick<
    ConnectionCallbackPayload,
    'httpMethod' | 'queryStringParameters' | 'body'
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
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
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

    // the redirect and the notification for one authorization often arrive together
    const { connectedAccount, isRepeatReport } =
      await this.cacheLockService.withLock(async () => {
        const existingConnectedAccount = isDefined(
          statePayload.reconnectingConnectedAccountId,
        )
          ? null
          : await this.findCallerConnectedAccountForUpstreamAccount({
              provider,
              workspaceId: statePayload.workspaceId,
              userWorkspaceId: statePayload.userWorkspaceId,
              externalAccountId,
            });

        return {
          isRepeatReport:
            isDefined(existingConnectedAccount) &&
            !isDefined(existingConnectedAccount.archivedAt) &&
            !isDefined(existingConnectedAccount.authFailedAt),
          connectedAccount: await this.connectedAccountService.persist({
            provider,
            // a repeat report without a token or handle keeps the stored ones
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

    // onConnect sets up remote state once per connection, not once per report
    if (!isRepeatReport) {
      await this.connectionProviderLifecycleHookService.dispatchOnConnect({
        provider,
        workspaceId: statePayload.workspaceId,
        connectedAccountId: connectedAccount.id,
      });
    }

    return { ...callbackResult, connectedAccountId: connectedAccount.id };
  }

  // services report one account several times (browser return, notification, retries), and each must update one connection
  private async findCallerConnectedAccountForUpstreamAccount({
    provider,
    workspaceId,
    userWorkspaceId,
    externalAccountId,
  }: {
    provider: Pick<ConnectionProviderEntity, 'id'>;
    workspaceId: string;
    userWorkspaceId: string;
    externalAccountId: string;
  }): Promise<Pick<
    ConnectedAccountEntity,
    'id' | 'archivedAt' | 'authFailedAt'
  > | null> {
    return this.connectedAccountRepository.findOne({
      where: {
        workspaceId,
        connectionProviderId: provider.id,
        userWorkspaceId,
        externalAccountId,
      },
      select: { id: true, archivedAt: true, authFailedAt: true },
    });
  }
}
