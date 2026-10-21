import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClickHouseModule } from 'src/database/clickhouse/clickhouse.module';
import { AdminApplicationMonitoringResolver } from 'src/engine/core-modules/application/application-monitoring/admin-application-monitoring.resolver';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationMonitoringResolver } from 'src/engine/core-modules/application/application-monitoring/application-monitoring.resolver';
import { ApplicationMonitoringService } from 'src/engine/core-modules/application/application-monitoring/application-monitoring.service';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
import { EventLogRetentionModule } from 'src/engine/core-modules/event-logs/retention/event-log-retention.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    ClickHouseModule,
    EventLogRetentionModule,
    FeatureFlagModule,
    PermissionsModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    ApplicationMonitoringService,
    ApplicationMonitoringResolver,
    AdminApplicationMonitoringResolver,
  ],
  exports: [ApplicationMonitoringService],
})
export class ApplicationMonitoringModule {}
