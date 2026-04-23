import { Command, CommandRunner, Option } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  MessagingAddSingleMessageToCacheForImportJob,
  type MessagingAddSingleMessageToCacheForImportJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-add-single-message-to-cache-for-import.job';

type MessagingSingleMessageImportCommandOptions = {
  messageExternalId: string;
  messageChannelId: string;
  workspaceId: string;
};

@Command({
  name: 'messaging:single-message-import',
  description: 'Enqueue a job to schedule the import of a single message',
})
export class MessagingSingleMessageImportCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: MessagingSingleMessageImportCommandOptions,
  ): Promise<void> {
    await this.messageQueueService.add<MessagingAddSingleMessageToCacheForImportJobData>(
      MessagingAddSingleMessageToCacheForImportJob.name,
      {
        messageExternalId: options.messageExternalId,
        messageChannelId: options.messageChannelId,
        workspaceId: options.workspaceId,
      },
    );
  }

  @Option({
    flags: '-m, --message-external-id [message_external_id]',
    description: 'Message external ID',
    required: true,
  })
  parseMessageId(value: string): string {
    return value;
  }

  @Option({
    flags: '-M, --message-channel-id [message_channel_id]',
    description: 'Message channel ID',
    required: true,
  })
  parseMessageChannelId(value: string): string {
    return value;
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'Workspace ID',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }
}
