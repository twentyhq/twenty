/* @license Enterprise */

import { Command, CommandRunner } from 'nest-commander';

import { enforceUsageCapCronPattern } from 'src/engine/core-modules/billing/crons/enforce-usage-cap.cron.pattern';
import { EnforceUsageCapJob } from 'src/engine/core-modules/billing/crons/enforce-usage-cap.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:billing:enforce-usage-cap',
  description:
    'Starts the cron that re-evaluates metered-credit caps from ClickHouse usage',
})
export class EnforceUsageCapCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: EnforceUsageCapJob.name,
      data: undefined,
      options: {
        repeat: { pattern: enforceUsageCapCronPattern },
      },
    });
  }
}
