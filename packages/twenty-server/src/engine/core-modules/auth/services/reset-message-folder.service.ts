import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export type ResetMessageFoldersInput = {
  workspaceId: string;
  connectedAccountId: string;
  manager: WorkspaceEntityManager;
};

@Injectable()
export class ResetMessageFolderService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async resetMessageFolders(input: ResetMessageFoldersInput): Promise<void> {
    const { workspaceId, connectedAccountId, manager } = input;

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const messageChannels = await messageChannelRepository.find({
      where: { connectedAccountId },
    });

    const messageChannelIds = messageChannels.map((channel) => channel.id);

    if (messageChannelIds.length === 0) {
      return;
    }

    const messageFolderRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageFolderWorkspaceEntity>(
        workspaceId,
        'messageFolder',
      );

    const messageFolders = await messageFolderRepository.find({
      where: {
        messageChannelId: In(messageChannelIds),
      },
    });

    if (messageFolders.length === 0) {
      return;
    }

    await messageFolderRepository.update(
      {
        messageChannelId: In(messageChannelIds),
      },
      {
        syncCursor: '',
      },
      manager,
    );

    return;
  }
}
