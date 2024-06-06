import { DataSeedDemoWorkspaceService } from 'src/database/commands/data-seed-demo-workspace/services/data-seed-demo-workspace.service';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';

@Processor(MessageQueue.cronQueue)
export class DataSeedDemoWorkspaceJob {
  constructor(
    private readonly dataSeedDemoWorkspaceService: DataSeedDemoWorkspaceService,
  ) {}

  @Process(DataSeedDemoWorkspaceJob.name)
  async handle(): Promise<void> {
    await this.dataSeedDemoWorkspaceService.seedDemo();
  }
}
