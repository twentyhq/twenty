import { Module } from '@nestjs/common';

import { AISQLQueryModule } from 'src/engine/core-modules/ai-sql-query/ai-sql-query.module';
import { AppTokenModule } from 'src/engine/core-modules/app-token/app-token.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { TimelineCalendarEventModule } from 'src/engine/core-modules/calendar/timeline-calendar-event.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { HealthModule } from 'src/engine/core-modules/health/health.module';
import { TimelineMessagingModule } from 'src/engine/core-modules/messaging/timeline-messaging.module';
import { OpenApiModule } from 'src/engine/core-modules/open-api/open-api.module';
import { PostgresCredentialsModule } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WorkflowTriggerCoreModule } from 'src/engine/core-modules/workflow/core-workflow-trigger.module';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

import { AnalyticsModule } from './analytics/analytics.module';
import { ClientConfigModule } from './client-config/client-config.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    HealthModule,
    AnalyticsModule,
    AuthModule,
    BillingModule,
    ClientConfigModule,
    FeatureFlagModule,
    FileModule,
    OpenApiModule,
    AppTokenModule,
    TimelineMessagingModule,
    TimelineCalendarEventModule,
    UserModule,
    WorkspaceModule,
    AISQLQueryModule,
    PostgresCredentialsModule,
    WorkflowTriggerCoreModule,
  ],
  exports: [
    AnalyticsModule,
    AuthModule,
    FeatureFlagModule,
    TimelineMessagingModule,
    TimelineCalendarEventModule,
    UserModule,
    WorkspaceModule,
  ],
})
export class CoreEngineModule {}
