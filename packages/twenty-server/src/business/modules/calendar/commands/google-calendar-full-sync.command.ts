import { Inject } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { ConnectedAccountService } from 'src/business/modules/calendar-and-messaging/repositories/connected-account/connected-account.service';
import {
  GoogleCalendarFullSyncJobData,
  GoogleCalendarFullSyncJob,
} from 'src/business/modules/calendar/jobs/google-calendar-full-sync.job';

interface GoogleCalendarFullSyncOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:google-calendar-full-sync',
  description:
    'Start google calendar full-sync for all workspaceMembers in a workspace.',
})
export class GoogleCalendarFullSyncCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly connectedAccountService: ConnectedAccountService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: GoogleCalendarFullSyncOptions,
  ): Promise<void> {
    await this.fetchWorkspaceCalendars(options.workspaceId);

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

  private async fetchWorkspaceCalendars(workspaceId: string): Promise<void> {
    const connectedAccounts =
      await this.connectedAccountService.getAll(workspaceId);

    for (const connectedAccount of connectedAccounts) {
      await this.messageQueueService.add<GoogleCalendarFullSyncJobData>(
        GoogleCalendarFullSyncJob.name,
        {
          workspaceId,
          connectedAccountId: connectedAccount.id,
        },
        {
          retryLimit: 2,
        },
      );
    }
  }
}
