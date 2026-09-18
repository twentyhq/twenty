/* @license Enterprise */

import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventLogEmitterModule } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UsageEventListener } from 'src/engine/core-modules/usage/listeners/usage-event.listener';
import { UsageAnalyticsModule } from 'src/engine/core-modules/usage/usage-analytics.module';
import { UsageRecorderService } from 'src/engine/core-modules/usage/services/usage-recorder.service';
import { UsageResolver } from 'src/engine/core-modules/usage/usage.resolver';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    UsageAnalyticsModule,
    DiscoveryModule,
    EventLogEmitterModule,
    FeatureFlagModule,
    PermissionsModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
    WorkspaceCacheModule,
  ],
  providers: [UsageResolver, UsageRecorderService, UsageEventListener],
  exports: [UsageAnalyticsModule, UsageRecorderService],
})
export class UsageModule {}
