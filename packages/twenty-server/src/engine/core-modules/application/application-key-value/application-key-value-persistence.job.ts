import { ApplicationKeyValueService } from 'src/engine/core-modules/application/application-key-value/services/application-key-value.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type ApplicationKeyValuePersistenceJobData = {
  applicationId: string;
  workspaceId: string;
  key: string;
  value: unknown;
};

@Processor(MessageQueue.workspaceQueue)
export class ApplicationKeyValuePersistenceJob {
  constructor(
    private readonly applicationKeyValueService: ApplicationKeyValueService,
  ) {}

  @Process(ApplicationKeyValuePersistenceJob.name)
  async handle(data: ApplicationKeyValuePersistenceJobData): Promise<void> {
    await this.applicationKeyValueService.setWorkspaceValue(data);
  }
}
