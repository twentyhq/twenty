import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  PENDING_WAKE_UP_SWEEP_CRON_PATTERN,
  PendingWakeUpSweepCronJob,
} from 'src/engine/core-modules/pending-wake-up/crons/jobs/pending-wake-up-sweep.cron.job';

@Command({
  name: 'cron:pending-wake-up:sweep',
  description: 'Reschedules pending wake-ups whose resume time passed',
})
export class PendingWakeUpSweepCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron({
      jobName: PendingWakeUpSweepCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: PENDING_WAKE_UP_SWEEP_CRON_PATTERN,
        },
      },
    });
  }
}
