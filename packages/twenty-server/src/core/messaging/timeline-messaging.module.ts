import { Module } from '@nestjs/common';

import { TimelineMessagingResolver } from 'src/core/messaging/timeline-messaging.resolver';
import { TimelineMessagingService } from 'src/core/messaging/timeline-messaging.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { UserModule } from 'src/core/user/user.module';
@Module({
  imports: [WorkspaceDataSourceModule, UserModule],
  exports: [],
  providers: [TimelineMessagingResolver, TimelineMessagingService],
})
export class TimelineMessagingModule {}
