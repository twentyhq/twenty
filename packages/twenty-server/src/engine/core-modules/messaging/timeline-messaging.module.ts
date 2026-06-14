import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GetMessagesService } from 'src/engine/core-modules/messaging/services/get-messages.service';
import { TimelineMessagingService } from 'src/engine/core-modules/messaging/services/timeline-messaging.service';
import { TimelineMessagingResolver } from 'src/engine/core-modules/messaging/timeline-messaging.resolver';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    UserModule,
    ConnectedAccountModule,
    FeatureFlagModule,
    PermissionsModule,
    TypeOrmModule.forFeature([
      MessageChannelEntity,
      ConnectedAccountEntity,
      UserWorkspaceEntity,
    ]),
  ],
  exports: [],
  providers: [
    TimelineMessagingResolver,
    TimelineMessagingService,
    GetMessagesService,
  ],
})
export class TimelineMessagingModule {}
