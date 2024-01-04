import { Module } from '@nestjs/common';

import { WorkspaceModule } from 'src/core/workspace/workspace.module';
import { UserModule } from 'src/core/user/user.module';
import { RefreshTokenModule } from 'src/core/refresh-token/refresh-token.module';
import { AuthModule } from 'src/core/auth/auth.module';
import { ApiRestModule } from 'src/core/api-rest/api-rest.module';
import { FeatureFlagModule } from 'src/core/feature-flag/feature-flag.module';
import { OpenApiModule } from 'src/core/open-api/open-api.module';
import { TimelineMessagingModule } from 'src/core/messaging/timeline-messaging.module';

import { AnalyticsModule } from './analytics/analytics.module';
import { FileModule } from './file/file.module';
import { ClientConfigModule } from './client-config/client-config.module';

@Module({
  imports: [
    AuthModule,
    WorkspaceModule,
    UserModule,
    RefreshTokenModule,
    AnalyticsModule,
    FileModule,
    ClientConfigModule,
    ApiRestModule,
    OpenApiModule,
    FeatureFlagModule,
    TimelineMessagingModule,
  ],
  exports: [
    AuthModule,
    WorkspaceModule,
    UserModule,
    AnalyticsModule,
    FeatureFlagModule,
    TimelineMessagingModule,
  ],
})
export class CoreModule {}
