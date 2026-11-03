/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingSeatArrangementSyncCronJob } from 'src/engine/core-modules/billing/seat-arrangement-sync/crons/billing-seat-arrangement-sync.cron.job';
import { BillingSeatArrangementSyncCronCommand } from 'src/engine/core-modules/billing/seat-arrangement-sync/crons/commands/billing-seat-arrangement-sync.cron.command';

@Module({
  imports: [TypeOrmModule.forFeature([BillingArrangementEntity])],
  providers: [
    BillingSeatArrangementSyncCronJob,
    BillingSeatArrangementSyncCronCommand,
  ],
  exports: [BillingSeatArrangementSyncCronCommand],
})
export class BillingSeatArrangementSyncModule {}
