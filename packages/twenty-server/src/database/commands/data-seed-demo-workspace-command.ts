import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { DataSeedDemoWorkspaceJob } from 'src/database/jobs/data-seed-demo-workspace.job';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';

@Command({
  name: 'workspace:seed:demo',
  description: 'Seed workspace with demo data. Use in development only.',
})
export class DataSeedDemoWorkspaceCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.add<object>(
      DataSeedDemoWorkspaceJob.name,
      {},
    );
  }
}
