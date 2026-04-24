/* @license Enterprise */

import { Module } from '@nestjs/common';

import { AppBillingController } from 'src/engine/core-modules/billing/app-billing/app-billing.controller';
import { AppBillingService } from 'src/engine/core-modules/billing/app-billing/app-billing.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';

@Module({
  imports: [
    AuthModule,
    ThrottlerModule,
    TwentyConfigModule,
    WorkspaceCacheStorageModule,
    WorkspaceEventEmitterModule,
  ],
  controllers: [AppBillingController],
  providers: [AppBillingService],
  exports: [AppBillingService],
})
export class AppBillingModule {}
