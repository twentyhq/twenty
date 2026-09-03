/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppBillingController } from 'src/engine/core-modules/billing/app-billing/app-billing.controller';
import { AppBillingService } from 'src/engine/core-modules/billing/app-billing/app-billing.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UsageModule } from 'src/engine/core-modules/usage/usage.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';

@Module({
  imports: [
    AuthModule,
    BillingModule,
    ThrottlerModule,
    TwentyConfigModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
    UsageModule,
    WorkspaceCacheModule,
    WorkspaceCacheStorageModule,
    WorkspaceEventEmitterModule,
  ],
  controllers: [AppBillingController],
  providers: [AppBillingService],
  exports: [AppBillingService],
})
export class AppBillingModule {}
