/* @license Enterprise */

import { Module } from '@nestjs/common';

import { ApplicationRecurringChargeService } from 'src/engine/core-modules/billing/app-billing/application-recurring-charge.service';
import { ApplicationRecurringChargeCronCommand } from 'src/engine/core-modules/billing/app-billing/crons/commands/application-recurring-charge.cron.command';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { UsageLimitModule } from 'src/engine/core-modules/usage-limit/usage-limit.module';
import { UsageAnalyticsModule } from 'src/engine/core-modules/usage/usage-analytics.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    BillingModule,
    UsageAnalyticsModule,
    UsageLimitModule,
    WorkspaceCacheModule,
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
