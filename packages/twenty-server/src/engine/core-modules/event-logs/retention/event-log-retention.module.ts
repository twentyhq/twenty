/* @license Enterprise */

import { Module } from '@nestjs/common';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { EventLogRetentionService } from 'src/engine/core-modules/event-logs/retention/services/event-log-retention.service';

@Module({
  imports: [BillingModule],
  providers: [EventLogRetentionService],
  exports: [EventLogRetentionService],
})
export class EventLogRetentionModule {}
