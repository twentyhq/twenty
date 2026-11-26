import { Command, CommandRunner } from 'nest-commander';

import {
  KEEP_WARM_LOGIC_FUNCTIONS_CRON_PATTERN,
  KeepWarmLogicFunctionsCronJob,
} from 'src/engine/core-modules/logic-function/logic-function-warm-up/crons/keep-warm-logic-functions.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:logic-function:keep-warm',
  description: 'Starts a cron job pinging logic functions marked as warm',
})
export class KeepWarmLogicFunctionsCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: KeepWarmLogicFunctionsCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: KEEP_WARM_LOGIC_FUNCTIONS_CRON_PATTERN },
      },
    });
  }
}
