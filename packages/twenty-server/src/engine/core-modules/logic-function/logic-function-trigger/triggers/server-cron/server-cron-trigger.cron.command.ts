import { Command, CommandRunner } from 'nest-commander';

import {
  SERVER_CRON_TRIGGER_CRON_PATTERN,
  ServerCronTriggerCronJob,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/server-cron-trigger.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:trigger:start-server-cron-trigger',
  description:
    'Starts a cron job to trigger server cron triggered logic functions',
})
export class ServerCronTriggerCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: ServerCronTriggerCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: SERVER_CRON_TRIGGER_CRON_PATTERN,
        },
      },
    });
  }
}
