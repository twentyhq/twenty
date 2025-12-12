import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';

export type CreateMessageChannelInput = {
  workspaceId: string;
  connectedAccountId: string;
  handle: string;
  messageVisibility?: MessageChannelVisibility;
  manager: WorkspaceEntityManager;
};

@Injectable()
export class CreateMessageChannelService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly syncMessageFoldersService: SyncMessageFoldersService,
  ) {}

  async createMessageChannel(
    input: CreateMessageChannelInput,
  ): Promise<string> {
    const {
      workspaceId,
      connectedAccountId,
      handle,
      messageVisibility,
      manager,
    } = input;

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
            workspaceId,
            'connectedAccount',
          );

        const connectedAccount = await connectedAccountRepository.findOne({
          where: { id: connectedAccountId },
        });

        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        const newMessageChannel = await messageChannelRepository.save(
          {
            id: v4(),
            connectedAccountId,
            type: MessageChannelType.EMAIL,
            handle,
            visibility:
              messageVisibility || MessageChannelVisibility.SHARE_EVERYTHING,
            syncStatus: MessageChannelSyncStatus.NOT_SYNCED,
            syncStage: MessageChannelSyncStage.PENDING_CONFIGURATION,
            pendingGroupEmailsAction:
              MessageChannelPendingGroupEmailsAction.NONE,
          },
          {},
          manager,
        );

        if (isDefined(connectedAccount)) {
          await this.syncMessageFoldersService.syncMessageFolders({
            workspaceId,
            messageChannel: {
              ...newMessageChannel,
              connectedAccount,
            },
            manager,
          });
        }

        return newMessageChannel.id;
      },
    );
  }
}
