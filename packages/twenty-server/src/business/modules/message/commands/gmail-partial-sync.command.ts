import { Inject } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import {
  GmailPartialSyncJob,
  GmailPartialSyncJobData,
} from 'src/business/modules/message/jobs/gmail-partial-sync.job';
import { ConnectedAccountService } from 'src/business/modules/calendar-and-messaging/repositories/connected-account/connected-account.service';

interface GmailPartialSyncOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:gmail-partial-sync',
  description: 'Fetch messages of all workspaceMembers in a workspace.',
})
export class GmailPartialSyncCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly connectedAccountService: ConnectedAccountService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: GmailPartialSyncOptions,
  ): Promise<void> {
    await this.fetchWorkspaceMessages(options.workspaceId);

    return;
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  private async fetchWorkspaceMessages(workspaceId: string): Promise<void> {
    const connectedAccounts =
      await this.connectedAccountService.getAll(workspaceId);

    for (const connectedAccount of connectedAccounts) {
      await this.messageQueueService.add<GmailPartialSyncJobData>(
        GmailPartialSyncJob.name,
        {
          workspaceId,
          connectedAccountId: connectedAccount.id,
        },
      );
    }
  }
}
