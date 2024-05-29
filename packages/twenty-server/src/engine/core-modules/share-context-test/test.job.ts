import { Logger, Scope } from '@nestjs/common';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';

import { SharedService } from './shared.service';

export type TestJobData = { workspaceId: string };

@Processor({
  queueName: MessageQueue.testQueue,
  scope: Scope.REQUEST,
})
export class TestJob {
  protected readonly logger = new Logger(TestJob.name);

  constructor(private readonly sharedService: SharedService) {}

  @Process('emailWelcome')
  async emailWelcomeFunc(data: TestJobData): Promise<void> {
    console.log('Handling emailWelcome job: ', data, this.sharedService);
    // Set workspace ID in context
    const count = await this.sharedService.getWorkspaceMemberEntityCount();

    this.logger.log(`Workspace entity count: ${count}`);
  }

  @Process('emailCoucou')
  async emailCoucouFunc(data: TestJobData): Promise<void> {
    console.log('Handling emailCoucou job: ', data, this.sharedService);
  }

  @Process()
  async emailAll(data: TestJobData): Promise<void> {
    console.log('Handling emailAll job: ', data, this.sharedService);
  }
}
