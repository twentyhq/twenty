import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { EntityManager } from 'typeorm';

import {
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
} from 'twenty-shared/types';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { SyncMessageFoldersService } from 'src/modules/messaging/message-folder-manager/services/sync-message-folders.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

export type CreateMessageChannelInput = {
  workspaceId: string;
  connectedAccountId: string;
  handle: string;
  messageVisibility?: MessageChannelVisibility;
  manager: EntityManager;
  skipMessageChannelConfiguration?: boolean;
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
      skipMessageChannelConfiguration,
    } = input;

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const newMessageChannelId = v4();

        const repo = manager.getRepository(MessageChannelEntity);

        await repo.save({
          id: newMessageChannelId,
          connectedAccountId,
          type: MessageChannelType.EMAIL,
          handle,
          visibility:
            messageVisibility || MessageChannelVisibility.SHARE_EVERYTHING,
          syncStatus: skipMessageChannelConfiguration
            ? MessageChannelSyncStatus.ONGOING
            : MessageChannelSyncStatus.NOT_SYNCED,
          syncStage: skipMessageChannelConfiguration
            ? MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING
            : MessageChannelSyncStage.PENDING_CONFIGURATION,
          pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction.NONE,
          workspaceId,
        } as MessageChannelEntity);

        const createdMessageChannel = await repo.findOne({
          where: { id: newMessageChannelId, workspaceId },
          relations: ['connectedAccount', 'messageFolders'],
        });

        if (!isDefined(createdMessageChannel)) {
          throw new Error('Message channel not found');
        }

        await this.syncMessageFoldersService.syncMessageFolders({
          messageChannel: createdMessageChannel,
          workspaceId,
        });

        return newMessageChannelId;
      },
      authContext,
    );
  }
}
