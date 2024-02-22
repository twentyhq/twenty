import { Module } from '@nestjs/common';

import { TimelineMessagingResolver } from 'src/core/messaging/timeline-messaging.resolver';
import { TimelineMessagingService } from 'src/core/messaging/timeline-messaging.service';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [WorkspaceDataSourceModule],
  exports: [],
  providers: [TimelineMessagingResolver, TimelineMessagingService],
})
export class TimelineMessagingModule {}
