import { Injectable } from '@nestjs/common';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  type MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type ResetMessageChannelsInput = {
  workspaceId: string;
  connectedAccountId: string;
  manager: WorkspaceEntityManager;
};

@Injectable()
export class ResetMessageChannelService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async resetMessageChannels(input: ResetMessageChannelsInput): Promise<void> {
    const { workspaceId, connectedAccountId, manager } = input;

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    await messageChannelRepository.update(
      {
        connectedAccountId,
      },
      {
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
        syncStatus: MessageChannelSyncStatus.ONGOING,
        syncCursor: '',
        syncStageStartedAt: null,
      },
      manager,
    );

    return;
  }
}
