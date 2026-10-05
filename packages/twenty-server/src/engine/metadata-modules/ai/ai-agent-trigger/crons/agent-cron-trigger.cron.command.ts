import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  AGENT_CRON_TRIGGER_CRON_PATTERN,
  AgentCronTriggerCronJob,
} from 'src/engine/metadata-modules/ai/ai-agent-trigger/crons/agent-cron-trigger.cron.job';

@Command({
  name: 'cron:agent:start-cron-trigger',
  description: 'Starts a cron job to run agents on their cron triggers',
})
export class AgentCronTriggerCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: AgentCronTriggerCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: AGENT_CRON_TRIGGER_CRON_PATTERN,
        },
      },
    });
  }
}
