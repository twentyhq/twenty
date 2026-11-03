/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingArrangementModule } from 'src/engine/core-modules/billing/billing-arrangement.module';
import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingLimitOverrideExpiryCronJob } from 'src/engine/core-modules/billing/limit-override/crons/billing-limit-override-expiry.cron.job';
import { BillingLimitOverrideExpiryCronCommand } from 'src/engine/core-modules/billing/limit-override/crons/commands/billing-limit-override-expiry.cron.command';
import { BillingLimitOverrideExpiryJob } from 'src/engine/core-modules/billing/limit-override/jobs/billing-limit-override-expiry.job';
import { BillingLimitOverrideService } from 'src/engine/core-modules/billing/limit-override/services/billing-limit-override.service';
import { UsageLimitModule } from 'src/engine/core-modules/usage-limit/usage-limit.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([BillingArrangementEntity]),
    BillingArrangementModule,
    UsageLimitModule,
  ],
  providers: [
    BillingLimitOverrideService,
    BillingLimitOverrideExpiryCronJob,
    BillingLimitOverrideExpiryJob,
    BillingLimitOverrideExpiryCronCommand,
    provideWorkspaceScopedRepository(BillingArrangementEntity),
  ],
  exports: [BillingLimitOverrideService, BillingLimitOverrideExpiryCronCommand],
})
export class BillingLimitOverrideModule {}
