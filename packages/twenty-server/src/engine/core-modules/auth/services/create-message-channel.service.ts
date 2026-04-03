import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { Repository } from 'typeorm';

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
  skipMessageChannelConfiguration?: boolean;
};

@Injectable()
export class CreateMessageChannelService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
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
      skipMessageChannelConfiguration,
    } = input;

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const newMessageChannelId = v4();

        await this.messageChannelRepository.save({
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
        });

        const createdMessageChannel =
          await this.messageChannelRepository.findOne({
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
