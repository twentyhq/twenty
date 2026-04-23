import { Injectable } from '@nestjs/common';

import { Any, In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { ConnectedAccountDataAccessService } from 'src/engine/metadata-modules/connected-account/data-access/services/connected-account-data-access.service';
import { MessageChannelDataAccessService } from 'src/engine/metadata-modules/message-channel/data-access/services/message-channel-data-access.service';
import { MessageFolderDataAccessService } from 'src/engine/metadata-modules/message-folder/data-access/services/message-folder-data-access.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';
import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderPendingSyncAction } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class MessageChannelSyncStatusService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageChannelDataAccessService: MessageChannelDataAccessService,
    private readonly messageFolderDataAccessService: MessageFolderDataAccessService,
    private readonly connectedAccountDataAccessService: ConnectedAccountDataAccessService,
    private readonly accountsToReconnectService: AccountsToReconnectService,
    private readonly metricsService: MetricsService,
  ) {}

  public async markAsMessagesListFetchPending(
    messageChannelIds: string[],
    workspaceId: string,
    preserveSyncStageStartedAt: boolean = false,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.messageChannelDataAccessService.update(
        workspaceId,
        { id: In(messageChannelIds) },
        {
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          ...(!preserveSyncStageStartedAt ? { syncStageStartedAt: null } : {}),
        },
      );
    }, authContext);
  }

  public async markAsMessagesImportPending(
    messageChannelIds: string[],
    workspaceId: string,
    preserveSyncStageStartedAt: boolean = false,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.messageChannelDataAccessService.update(
        workspaceId,
        { id: In(messageChannelIds) },
        {
          syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
          ...(!preserveSyncStageStartedAt ? { syncStageStartedAt: null } : {}),
        },
      );
    }, authContext);
  }

  public async resetAndMarkAsMessagesListFetchPending(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    for (const messageChannelId of messageChannelIds) {
      await this.cacheStorage.del(
        `messages-to-import:${workspaceId}:${messageChannelId}`,
      );
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.messageChannelDataAccessService.update(
        workspaceId,
        { id: In(messageChannelIds) },
        {
          syncCursor: '',
          syncStageStartedAt: null,
          throttleFailureCount: 0,
          throttleRetryAfter: null,
          pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction.NONE,
        },
      );

      await this.messageFolderDataAccessService.update(
        workspaceId,
        { messageChannelId: In(messageChannelIds) },
        {
          syncCursor: '',
          pendingSyncAction: MessageFolderPendingSyncAction.NONE,
        },
      );
    }, authContext);

    await this.markAsMessagesListFetchPending(messageChannelIds, workspaceId);
  }

  public async resetSyncStageStartedAt(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.messageChannelDataAccessService.update(
        workspaceId,
        { id: In(messageChannelIds) },
        { syncStageStartedAt: null },
      );
    }, authContext);
  }

  public async markAsMessagesListFetchScheduled(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.messageChannelDataAccessService.update(
        workspaceId,
        { id: In(messageChannelIds) },
        {
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
          syncStatus: MessageChannelSyncStatus.ONGOING,
          syncStageStartedAt: new Date().toISOString(),
        },
      );
    }, authContext);
  }

  public async markAsMessagesListFetchOngoing(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.messageChannelDataAccessService.update(
        workspaceId,
        { id: In(messageChannelIds) },
        {
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
          syncStatus: MessageChannelSyncStatus.ONGOING,
          syncStageStartedAt: new Date().toISOString(),
        },
      );
    }, authContext);
  }

  public async markAsCompletedAndMarkAsMessagesListFetchPending(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.messageChannelDataAccessService.update(
        workspaceId,
        { id: In(messageChannelIds) },
        {
          syncStatus: MessageChannelSyncStatus.ACTIVE,
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          throttleFailureCount: 0,
          throttleRetryAfter: null,
          syncStageStartedAt: null,
          syncedAt: new Date().toISOString(),
        },
      );
    }, authContext);

    await this.metricsService.batchIncrementCounter({
      key: MetricsKeys.MessageChannelSyncJobActive,
      eventIds: messageChannelIds,
    });
  }

  public async markAsMessagesImportScheduled(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.messageChannelDataAccessService.update(
        workspaceId,
        { id: In(messageChannelIds) },
        {
          syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
        },
      );
    }, authContext);
  }

  public async markAsMessagesImportOngoing(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.messageChannelDataAccessService.update(
        workspaceId,
        { id: In(messageChannelIds) },
        {
          syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
          syncStatus: MessageChannelSyncStatus.ONGOING,
          syncStageStartedAt: new Date().toISOString(),
        },
      );
    }, authContext);
  }

  public async markAsFailed(
    messageChannelIds: string[],
    workspaceId: string,
    syncStatus:
      | MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS
      | MessageChannelSyncStatus.FAILED_UNKNOWN,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.messageChannelDataAccessService.update(
        workspaceId,
        { id: In(messageChannelIds) },
        {
          syncStage: MessageChannelSyncStage.FAILED,
          syncStatus: syncStatus,
          throttleRetryAfter: null,
        },
      );

      const metricsKey =
        syncStatus === MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS
          ? MetricsKeys.MessageChannelSyncJobFailedInsufficientPermissions
          : MetricsKeys.MessageChannelSyncJobFailedUnknown;

      await this.metricsService.batchIncrementCounter({
        key: metricsKey,
        eventIds: messageChannelIds,
      });

      if (
        syncStatus === MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS
      ) {
        const messageChannels = await this.messageChannelDataAccessService.find(
          workspaceId,
          { id: In(messageChannelIds) },
        );

        const connectedAccountIds = messageChannels.map(
          (messageChannel) => messageChannel.connectedAccountId,
        );

        await this.connectedAccountDataAccessService.update(
          workspaceId,
          { id: Any(connectedAccountIds) },
          {
            authFailedAt: new Date(),
          },
        );

        await this.addToAccountsToReconnect(
          messageChannels.map((messageChannel) => messageChannel.id),
          workspaceId,
        );
      }
    }, authContext);
  }

  private async addToAccountsToReconnect(
    messageChannelIds: string[],
    workspaceId: string,
  ) {
    if (!messageChannelIds.length) {
      return;
    }

    const messageChannels = await this.messageChannelDataAccessService.findMany(
      workspaceId,
      {
        where: { id: In(messageChannelIds) },
      },
    );

    const workspaceMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    for (const messageChannel of messageChannels) {
      const connectedAccount =
        await this.connectedAccountDataAccessService.findOne(workspaceId, {
          where: { id: messageChannel.connectedAccountId },
        });

      if (!connectedAccount) {
        continue;
      }

      const workspaceMember = await workspaceMemberRepository.findOne({
        where: { id: connectedAccount.accountOwnerId },
      });

      if (!workspaceMember) {
        continue;
      }

      await this.accountsToReconnectService.addAccountToReconnectByKey(
        AccountsToReconnectKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
        workspaceMember.userId,
        workspaceId,
        connectedAccount.id,
      );
    }
  }
}
