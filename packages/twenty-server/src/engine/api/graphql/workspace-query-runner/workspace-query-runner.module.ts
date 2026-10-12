import { Module } from '@nestjs/common';

import { TelemetryListener } from 'src/engine/api/graphql/workspace-query-runner/listeners/telemetry.listener';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { TelemetryModule } from 'src/engine/core-modules/telemetry/telemetry.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';

import { EntityEventsToDbListener } from './listeners/entity-events-to-db.listener';

@Module({
  imports: [
    TelemetryModule,
    TimelineActivityModule,
    WorkspaceCacheModule,
    BillingModule,
  ],
  providers: [EntityEventsToDbListener, TelemetryListener],
})
export class WorkspaceQueryRunnerModule {}
