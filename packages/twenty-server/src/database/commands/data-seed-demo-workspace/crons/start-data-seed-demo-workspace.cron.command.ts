import { Command, CommandRunner } from 'nest-commander';

import { dataSeedDemoWorkspaceCronPattern } from 'src/database/commands/data-seed-demo-workspace/crons/data-seed-demo-workspace-cron-pattern';
import { DataSeedDemoWorkspaceJob } from 'src/database/commands/data-seed-demo-workspace/jobs/data-seed-demo-workspace.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'workspace-seed-demo:cron:start',
  description: 'Start cron to seed workspace with demo data.',
})
export class StartDataSeedDemoWorkspaceCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>(
      DataSeedDemoWorkspaceJob.name,
      undefined,
      {
        repeat: {
          pattern: dataSeedDemoWorkspaceCronPattern,
        },
      },
    );
  }
}
