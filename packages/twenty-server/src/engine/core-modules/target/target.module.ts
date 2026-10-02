import { Module } from '@nestjs/common';

import { MessageCalendarTargetReadinessService } from 'src/engine/core-modules/target/services/message-calendar-target-readiness.service';
import { TimelineRecordAccessService } from 'src/engine/core-modules/target/services/timeline-record-access.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [
    MessageCalendarTargetReadinessService,
    TimelineRecordAccessService,
  ],
  exports: [MessageCalendarTargetReadinessService, TimelineRecordAccessService],
})
export class TargetModule {}
