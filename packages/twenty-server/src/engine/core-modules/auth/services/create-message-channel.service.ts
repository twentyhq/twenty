import { Injectable } from '@nestjs/common';

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
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

export type CreateMessageChannelInput = {
  workspaceId: string;
  connectedAccountId: string;
  handle: string;
  messageVisibility?: MessageChannelVisibility;
  skipMessageChannelConfiguration?: boolean;
  transactionManager: EntityManager;
};

@Injectable()
export class CreateMessageChannelService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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
      transactionManager,
    } = input;

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageChannelRepo =
          transactionManager.getRepository(MessageChannelEntity);
        const newMessageChannelId = v4();

        await messageChannelRepo.save({
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

        return newMessageChannelId;
      },
      authContext,
    );
  }
}
