import { Module } from '@nestjs/common';

import { WorkspaceModule } from 'src/engine/features/workspace/workspace.module';
import { UserModule } from 'src/engine/features/user/user.module';
import { RefreshTokenModule } from 'src/engine/features/refresh-token/refresh-token.module';
import { AuthModule } from 'src/engine/features/auth/auth.module';
import { FeatureFlagModule } from 'src/engine/features/feature-flag/feature-flag.module';
import { OpenApiModule } from 'src/engine/features/open-api/open-api.module';
import { TimelineMessagingModule } from 'src/engine/features/messaging/timeline-messaging.module';
import { BillingModule } from 'src/engine/features/billing/billing.module';
import { HealthModule } from 'src/engine/features/health/health.module';

import { AnalyticsModule } from './analytics/analytics.module';
import { FileModule } from './file/file.module';
import { ClientConfigModule } from './client-config/client-config.module';

@Module({
  imports: [
    AnalyticsModule,
    AuthModule,
    BillingModule,
    ClientConfigModule,
    FeatureFlagModule,
    FileModule,
    OpenApiModule,
    RefreshTokenModule,
    TimelineMessagingModule,
    UserModule,
    WorkspaceModule,
    HealthModule,
  ],
  exports: [
    AnalyticsModule,
    AuthModule,
    FeatureFlagModule,
    TimelineMessagingModule,
    UserModule,
    WorkspaceModule,
  ],
})
export class FeaturesModule {}
