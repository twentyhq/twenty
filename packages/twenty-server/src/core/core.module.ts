import { Module } from '@nestjs/common';

import { WorkspaceModule } from 'src/core/workspace/workspace.module';
import { UserModule } from 'src/core/user/user.module';
import { RefreshTokenModule } from 'src/core/refresh-token/refresh-token.module';
import { AuthModule } from 'src/core/auth/auth.module';
import { ApiRestModule } from 'src/core/api-rest/api-rest.module';
import { FeatureFlagModule } from 'src/core/feature-flag/feature-flag.module';
import { OpenApiModule } from 'src/core/open-api/open-api.module';
import { TimelineMessagingModule } from 'src/core/messaging/timeline-messaging.module';
import { BillingModule } from 'src/core/billing/billing.module';

import { AnalyticsModule } from './analytics/analytics.module';
import { FileModule } from './file/file.module';
import { ClientConfigModule } from './client-config/client-config.module';

@Module({
  imports: [
    AnalyticsModule,
    ApiRestModule,
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
export class CoreModule {}
