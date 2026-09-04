import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationLifecycleReconciliationCronCommand } from 'src/engine/core-modules/application/application-lifecycle-reconciliation/commands/application-lifecycle-reconciliation.cron.command';
import { ApplicationLifecycleReconciliationService } from 'src/engine/core-modules/application/application-lifecycle-reconciliation/services/application-lifecycle-reconciliation.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationEntity]), ApplicationModule],
  providers: [
    ApplicationLifecycleReconciliationService,
    ApplicationLifecycleReconciliationCronCommand,
  ],
  exports: [
    ApplicationLifecycleReconciliationService,
    ApplicationLifecycleReconciliationCronCommand,
  ],
})
export class ApplicationLifecycleReconciliationModule {}
