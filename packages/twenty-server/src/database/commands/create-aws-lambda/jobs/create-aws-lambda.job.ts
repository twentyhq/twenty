import { CreateAWSLambdaService } from 'src/database/commands/create-aws-lambda/services/create-aws-lambda.service';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';

export type CreateAWSLambdaJobData = {
  script: string;
};

@Processor(MessageQueue.scriptQueue)
export class CreateAWSLambdaJob {
  constructor(
    private readonly createAWSLambdaService: CreateAWSLambdaService,
  ) {}

  @Process(CreateAWSLambdaJob.name)
  async handle(data: CreateAWSLambdaJobData): Promise<void> {
    await this.createAWSLambdaService.handle(data.script);
  }
}
