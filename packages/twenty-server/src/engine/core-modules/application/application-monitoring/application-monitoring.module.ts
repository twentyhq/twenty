import { Module } from '@nestjs/common';

import { ClickHouseModule } from 'src/database/clickhouse/clickhouse.module';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationMonitoringResolver } from 'src/engine/core-modules/application/application-monitoring/application-monitoring.resolver';
import { ApplicationMonitoringService } from 'src/engine/core-modules/application/application-monitoring/application-monitoring.service';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
import { EventLogRetentionModule } from 'src/engine/core-modules/event-logs/retention/event-log-retention.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    ClickHouseModule,
    EventLogRetentionModule,
    FeatureFlagModule,
    PermissionsModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [ApplicationMonitoringService, ApplicationMonitoringResolver],
  exports: [ApplicationMonitoringService],
})
export class ApplicationMonitoringModule {}
