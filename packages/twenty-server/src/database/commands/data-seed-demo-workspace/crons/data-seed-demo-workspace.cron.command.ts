import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { dataSeedDemoWorkspaceCronPattern } from 'src/database/commands/data-seed-demo-workspace/crons/data-seed-demo-workspace-cron-pattern';
import { DataSeedDemoWorkspaceJob } from 'src/database/commands/data-seed-demo-workspace/jobs/data-seed-demo-workspace.job';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';

@Command({
  name: 'workspace:cron:seed:demo',
  description: 'Seed workspace with demo data.',
})
export class DataSeedDemoWorkspaceCronCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>(
      DataSeedDemoWorkspaceJob.name,
      undefined,
      dataSeedDemoWorkspaceCronPattern,
    );
  }
}
