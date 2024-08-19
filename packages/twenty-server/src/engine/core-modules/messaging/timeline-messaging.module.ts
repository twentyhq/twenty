import { Module } from '@nestjs/common';

import { GetMessagesService } from 'src/engine/core-modules/messaging/services/get-messages.service';
import { TimelineMessagingService } from 'src/engine/core-modules/messaging/services/timeline-messaging.service';
import { TimelineMessagingResolver } from 'src/engine/core-modules/messaging/timeline-messaging.resolver';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
@Module({
  imports: [WorkspaceDataSourceModule, UserModule],
  exports: [],
  providers: [
    TimelineMessagingResolver,
    TimelineMessagingService,
    GetMessagesService,
  ],
})
export class TimelineMessagingModule {}
