/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRecurringChargeService } from 'src/engine/core-modules/billing/app-billing/application-recurring-charge.service';
import { ApplicationRecurringChargeCronCommand } from 'src/engine/core-modules/billing/app-billing/crons/commands/application-recurring-charge.cron.command';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { UsageModule } from 'src/engine/core-modules/usage/usage.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';

@Module({
  imports: [
    BillingModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
    UsageModule,
    WorkspaceCacheModule,
    WorkspaceEventEmitterModule,
  ],
  providers: [
    ApplicationRecurringChargeService,
    ApplicationRecurringChargeCronCommand,
  ],
  exports: [
    ApplicationRecurringChargeService,
    ApplicationRecurringChargeCronCommand,
  ],
})
export class ApplicationRecurringChargeModule {}
