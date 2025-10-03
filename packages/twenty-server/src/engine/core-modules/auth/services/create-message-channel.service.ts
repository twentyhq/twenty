import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

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
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
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
      },
      {},
      manager,
    );

    return newMessageChannel.id;
  }
}
