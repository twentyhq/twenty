import { Module } from '@nestjs/common';

import { JobMemoryReconcileCommand } from 'src/engine/core-modules/message-queue/commands/job-memory-reconcile.command';

@Module({
  providers: [JobMemoryReconcileCommand],
})
export class JobMemoryReconcileModule {}
