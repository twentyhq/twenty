/* @license Enterprise */

import { Command, CommandRunner } from 'nest-commander';

import { BILLING_SEAT_ARRANGEMENT_SYNC_CRON_PATTERN } from 'src/engine/core-modules/billing/seat-arrangement-sync/constants/billing-seat-arrangement-sync.cron-pattern.constant';
import { BillingSeatArrangementSyncCronJob } from 'src/engine/core-modules/billing/seat-arrangement-sync/crons/billing-seat-arrangement-sync.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Command({
  name: 'cron:billing:seat-arrangement-sync',
  description:
    'Starts a cron job to sync billed seats when a seat arrangement starts, ends or changes',
})
export class BillingSeatArrangementSyncCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: BillingSeatArrangementSyncCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: BILLING_SEAT_ARRANGEMENT_SYNC_CRON_PATTERN },
      },
    });
  }
}
