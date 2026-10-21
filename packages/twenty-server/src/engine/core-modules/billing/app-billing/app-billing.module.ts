/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppBillingController } from 'src/engine/core-modules/billing/app-billing/app-billing.controller';
import { AppBillingService } from 'src/engine/core-modules/billing/app-billing/app-billing.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UsageLimitModule } from 'src/engine/core-modules/usage-limit/usage-limit.module';
import { UsageAnalyticsModule } from 'src/engine/core-modules/usage/usage-analytics.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    AuthModule,
    BillingModule,
    ThrottlerModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity, WorkspaceEntity]),
    UsageAnalyticsModule,
    UsageLimitModule,
    WorkspaceCacheModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [AppBillingController],
  providers: [AppBillingService],
})
export class AppBillingModule {}
