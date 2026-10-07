import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { type PendingWakeUpOwnerType } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-type.type';

export const PENDING_WAKE_UP_SWEEP_CRON_PATTERN = '*/5 * * * *';

const OVERDUE_GRACE_INTERVAL = '5 minutes';
const OVERDUE_WAKE_UPS_BATCH_SIZE = 1000;

type OverdueWakeUpRow = {
  id: string;
  workspaceId: string;
  ownerType: PendingWakeUpOwnerType;
  ownerId: string;
};

// Resolutions are queued jobs, so a lost job would leave its wake-up forever; claiming makes a duplicate harmless
@Processor(MessageQueue.cronQueue)
export class PendingWakeUpSweepCronJob {
  private readonly logger = new Logger(PendingWakeUpSweepCronJob.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly pendingWakeUpService: PendingWakeUpService,
  ) {}

  @Process(PendingWakeUpSweepCronJob.name)
  @SentryCronMonitor(
    PendingWakeUpSweepCronJob.name,
    PENDING_WAKE_UP_SWEEP_CRON_PATTERN,
  )
  async handle() {
    const overdueWakeUps: OverdueWakeUpRow[] = await this.coreDataSource.query(
      `SELECT "id", "workspaceId", "ownerType", "ownerId" FROM "core"."pendingWakeUp"
       WHERE "resumeAt" < now() - interval '${OVERDUE_GRACE_INTERVAL}'
       ORDER BY "resumeAt" ASC
       LIMIT $1`,
      [OVERDUE_WAKE_UPS_BATCH_SIZE],
    );

    for (const overdueWakeUp of overdueWakeUps) {
      await this.pendingWakeUpService.scheduleOverdueResolution(overdueWakeUp);
    }

    if (overdueWakeUps.length > 0) {
      this.logger.log(
        `Rescheduled ${overdueWakeUps.length} overdue pending wake-ups`,
      );
    }
  }
}
