import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';

interface RunCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'workflows:start',
  description: 'Start a workflow manually',
})
export class StartWorkflowCommand extends CommandRunner {
  private readonly logger = new Logger(StartWorkflowCommand.name);

  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(_passedParam: string[], options: RunCommandOptions): Promise<void> {
    this.logger.log('Hey! Command started');

    this.messageQueueService.addFlow({
      name: 'renovate-interior',
      queueName: MessageQueue.workflowQueue,
      data: {},
      children: [
        {
          name: 'paint',
          data: { place: 'ceiling' },
          queueName: MessageQueue.workflowQueue,
        },
        {
          name: 'paint',
          data: { place: 'walls' },
          queueName: MessageQueue.workflowQueue,
        },
        {
          name: 'fix',
          data: { place: 'floor' },
          queueName: MessageQueue.workflowQueue,
        },
      ],
    });
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }
}
