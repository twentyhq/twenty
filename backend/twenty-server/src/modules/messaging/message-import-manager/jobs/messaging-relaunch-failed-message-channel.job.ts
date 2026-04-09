import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageChannelDataAccessService } from 'src/engine/metadata-modules/message-channel/data-access/services/message-channel-data-access.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type MessagingRelaunchFailedMessageChannelJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingRelaunchFailedMessageChannelJob {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageChannelDataAccessService: MessageChannelDataAccessService,
  ) {}

  @Process(MessagingRelaunchFailedMessageChannelJob.name)
  async handle(data: MessagingRelaunchFailedMessageChannelJobData) {
    const { workspaceId, messageChannelId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageChannel = await this.messageChannelDataAccessService.findOne(
        workspaceId,
        {
          where: {
            id: messageChannelId,
          },
        },
      );

      if (
        !messageChannel ||
        messageChannel.syncStage !== MessageChannelSyncStage.FAILED ||
        messageChannel.syncStatus !== MessageChannelSyncStatus.FAILED_UNKNOWN
      ) {
        return;
      }

      await this.messageChannelDataAccessService.update(
        workspaceId,
        { id: messageChannelId },
        {
          syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
          syncStatus: MessageChannelSyncStatus.ACTIVE,
          throttleFailureCount: 0,
          throttleRetryAfter: null,
          syncStageStartedAt: null,
        },
      );
    }, authContext);
  }
}
