import { Module } from '@nestjs/common';

import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { GetMessagesService } from 'src/engine/core-modules/messaging/services/get-messages.service';
import { TimelineMessagingService } from 'src/engine/core-modules/messaging/services/timeline-messaging.service';
import { TimelineMessagingResolver } from 'src/engine/core-modules/messaging/timeline-messaging.resolver';
import { RelatedPersonIdsModule } from 'src/engine/core-modules/related-person-ids/related-person-ids.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { TargetModule } from 'src/engine/core-modules/target/target.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    FileUrlModule,
    UserModule,
    ConnectedAccountModule,
    FeatureFlagModule,
    PermissionsModule,
    RelatedPersonIdsModule,
    TargetModule,
  ],
  exports: [],
  providers: [
    TimelineMessagingResolver,
    TimelineMessagingService,
    GetMessagesService,
  ],
})
export class TimelineMessagingModule {}
