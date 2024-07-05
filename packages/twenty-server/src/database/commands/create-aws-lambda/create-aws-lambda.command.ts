import fs from 'fs';
import path from 'path';

import { Command, CommandRunner } from 'nest-commander';

import {
  CreateAWSLambdaJob,
  CreateAWSLambdaJobData,
} from 'src/database/commands/create-aws-lambda/jobs/create-aws-lambda.job';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';

@Command({
  name: 'code-runner:create-aws-lambda',
  description: 'Create aws lambda function',
})
export class CreateAWSLambdaCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.scriptQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const filePath = path.join(__dirname, 'example-script.js');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    await this.messageQueueService.add<CreateAWSLambdaJobData>(
      CreateAWSLambdaJob.name,
      {
        script: fileContent,
      },
      { retryLimit: 3 },
    );
  }
}
