/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClickHouseModule } from 'src/database/clickHouse/clickHouse.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UsageResolver } from 'src/engine/core-modules/usage/usage.resolver';
import { UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { UsageEventWriterService } from 'src/engine/core-modules/usage/services/usage-event-writer.service';
import { UsageEventListener } from 'src/engine/core-modules/usage/listeners/usage-event.listener';

@Module({
  imports: [
    ClickHouseModule,
    FeatureFlagModule,
    PermissionsModule,
    TypeOrmModule.forFeature([UserWorkspaceEntity]),
  ],
  providers: [
    UsageResolver,
    UsageAnalyticsService,
    UsageEventWriterService,
    UsageEventListener,
  ],
  exports: [UsageEventWriterService, UsageAnalyticsService],
})
export class UsageModule {}
