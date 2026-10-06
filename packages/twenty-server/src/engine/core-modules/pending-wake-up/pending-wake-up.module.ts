import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PendingWakeUpSweepCronCommand } from 'src/engine/core-modules/pending-wake-up/crons/commands/pending-wake-up-sweep.cron.command';
import { PendingWakeUpSweepCronJob } from 'src/engine/core-modules/pending-wake-up/crons/jobs/pending-wake-up-sweep.cron.job';
import { PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { ResumePendingWakeUpJob } from 'src/engine/core-modules/pending-wake-up/jobs/resume-pending-wake-up.job';
import { PendingWakeUpDatabaseEventListener } from 'src/engine/core-modules/pending-wake-up/listeners/pending-wake-up-database-event.listener';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { PendingWakeUpResolverService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-resolver.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { RecordShareModule } from 'src/engine/core-modules/record-share/record-share.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PendingWakeUpEntity]),
    RecordShareModule,
    WorkspaceCacheModule,
  ],
  providers: [
    PendingWakeUpService,
    PendingWakeUpOwnerHandlerRegistryService,
    PendingWakeUpResolverService,
    ResumePendingWakeUpJob,
    PendingWakeUpDatabaseEventListener,
    PendingWakeUpSweepCronJob,
    PendingWakeUpSweepCronCommand,
    provideWorkspaceScopedRepository(PendingWakeUpEntity),
  ],
  exports: [
    PendingWakeUpService,
    PendingWakeUpOwnerHandlerRegistryService,
    PendingWakeUpSweepCronCommand,
  ],
})
export class PendingWakeUpModule {}
