import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { wasStateIssuedBeforeAccountChange } from 'src/engine/core-modules/application/connection-provider/utils/was-state-issued-before-account-change.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type ConnectedAccountScope } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class ConnectionProviderReportedAccountService {
  constructor(
    private readonly connectedAccountService: ConnectionProviderConnectedAccountService,
    private readonly connectionProviderLifecycleHookService: ConnectionProviderLifecycleHookService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  // Returns null when the authorization predates a disconnect or auth failure of that account.
  async persistReportedAccount({
    provider,
    workspaceId,
    userId,
    userWorkspaceId,
    scope,
    reconnectingConnectedAccountId,
    authorizationIssuedAtSeconds,
    reportedAccount: { externalAccountId, handle, accessToken },
  }: {
    provider: Pick<
      ConnectionProviderEntity,
      | 'id'
      | 'name'
      | 'displayName'
      | 'applicationId'
      | 'onConnectLogicFunctionUniversalIdentifier'
    >;
    workspaceId: string;
    userId: string;
    userWorkspaceId: string;
    scope: ConnectedAccountScope;
    reconnectingConnectedAccountId: string | null;
    authorizationIssuedAtSeconds: number | undefined;
    reportedAccount: {
      externalAccountId: string;
      handle?: string;
      accessToken?: PlaintextString;
    };
  }): Promise<string | null> {
    const { connectedAccount, isRepeatReport } =
      await this.cacheLockService.withLock(async () => {
        const existingConnectedAccount =
          await this.connectedAccountService.findConnectedAccountForReport({
            provider,
            workspaceId,
            userWorkspaceId,
            externalAccountId,
            reconnectingConnectedAccountId,
          });

        if (
          isDefined(existingConnectedAccount) &&
          wasStateIssuedBeforeAccountChange({
            stateIssuedAtSeconds: authorizationIssuedAtSeconds,
            connectedAccount: existingConnectedAccount,
          })
        ) {
          return { connectedAccount: null, isRepeatReport: true };
        }

        return {
          isRepeatReport:
            !isDefined(reconnectingConnectedAccountId) &&
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
            workspaceId,
            userId,
            userWorkspaceId,
            scope,
            reconnectingConnectedAccountId:
              reconnectingConnectedAccountId ??
              existingConnectedAccount?.id ??
              null,
          }),
        };
      }, `app-custom-connection:${workspaceId}:${provider.id}:${userWorkspaceId}:${externalAccountId}`);

    if (!isDefined(connectedAccount)) {
      return null;
    }

    if (!isRepeatReport) {
      await this.connectionProviderLifecycleHookService.dispatchOnConnect({
        provider,
        workspaceId,
        connectedAccountId: connectedAccount.id,
      });
    }

    return connectedAccount.id;
  }
}
