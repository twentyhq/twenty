/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingArrangementModule } from 'src/engine/core-modules/billing/billing-arrangement.module';
import { UsageLimitInstanceOverrideExpiryCronCommand } from 'src/engine/core-modules/usage-limit/instance-override/crons/commands/usage-limit-instance-override-expiry.cron.command';
import { UsageLimitInstanceOverrideExpiryCronJob } from 'src/engine/core-modules/usage-limit/instance-override/crons/usage-limit-instance-override-expiry.cron.job';
import { UsageLimitInstanceOverrideExpiryJob } from 'src/engine/core-modules/usage-limit/instance-override/jobs/usage-limit-instance-override-expiry.job';
import { UsageLimitInstanceOverrideService } from 'src/engine/core-modules/usage-limit/instance-override/services/usage-limit-instance-override.service';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { UsageLimitModule } from 'src/engine/core-modules/usage-limit/usage-limit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsageLimitEntity]),
    BillingArrangementModule,
    UsageLimitModule,
  ],
  providers: [
    UsageLimitInstanceOverrideService,
    UsageLimitInstanceOverrideExpiryCronJob,
    UsageLimitInstanceOverrideExpiryJob,
    UsageLimitInstanceOverrideExpiryCronCommand,
  ],
  exports: [
    UsageLimitInstanceOverrideService,
    UsageLimitInstanceOverrideExpiryCronCommand,
  ],
})
export class UsageLimitInstanceOverrideModule {}
