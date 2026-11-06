import { Module } from '@nestjs/common';

import { JobMemoryReconcileCronCommand } from 'src/engine/core-modules/message-queue/crons/commands/job-memory-reconcile.cron.command';
import { JobMemoryReconcileCronJob } from 'src/engine/core-modules/message-queue/crons/jobs/job-memory-reconcile.cron.job';

@Module({
  providers: [JobMemoryReconcileCronJob, JobMemoryReconcileCronCommand],
  exports: [JobMemoryReconcileCronCommand],
})
export class JobMemoryReconcileModule {}
