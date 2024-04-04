import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { DataSeedDemoWorkspaceService } from 'src/database/commands/data-seed-demo-workspace/services/data-seed-demo-workspace.service';

@Injectable()
export class DataSeedDemoWorkspaceJob implements MessageQueueJob<undefined> {
  constructor(
    private readonly dataSeedDemoWorkspaceService: DataSeedDemoWorkspaceService,
  ) {}

  async handle(): Promise<void> {
    await this.dataSeedDemoWorkspaceService.seedDemo();
  }
}
