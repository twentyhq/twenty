/* @license Enterprise */

import { AppBillingChargeCronCommand } from 'src/engine/core-modules/billing/app-billing/app-billing-charge.cron.command';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClickHouseModule } from 'src/database/clickhouse/clickhouse.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { BillingAppChargeEntity } from 'src/engine/core-modules/billing/entities/billing-app-charge.entity';
import { AppBillingChargeService } from 'src/engine/core-modules/billing/app-billing/app-billing-charge.service';

import { AppBillingController } from 'src/engine/core-modules/billing/app-billing/app-billing.controller';
import { AppBillingService } from 'src/engine/core-modules/billing/app-billing/app-billing.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { UsageModule } from 'src/engine/core-modules/usage/usage.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BillingAppChargeEntity]),
    ClickHouseModule,
    CacheLockModule,
    MessageQueueModule,
    AuthModule,
    BillingModule,
    ThrottlerModule,
    TwentyConfigModule,
    UsageModule,
    WorkspaceCacheModule,
    WorkspaceCacheStorageModule,
    WorkspaceEventEmitterModule,
  ],
  controllers: [AppBillingController],
  providers: [
    AppBillingService,
    AppBillingChargeService,
    AppBillingChargeCronCommand,
  ],
  exports: [
    AppBillingService,
    AppBillingChargeService,
    AppBillingChargeCronCommand,
  ],
})
export class AppBillingModule {}
