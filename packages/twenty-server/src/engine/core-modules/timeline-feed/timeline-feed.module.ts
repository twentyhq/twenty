import { Module } from '@nestjs/common';

import { RelatedRecordIdsService } from 'src/engine/core-modules/timeline-feed/projection/services/related-record-ids.service';
import { StaticTimelineProjectionPolicyProvider } from 'src/engine/core-modules/timeline-feed/services/static-timeline-projection-policy.provider';
import { TimelineActivityProjectionService } from 'src/engine/core-modules/timeline-feed/services/timeline-activity-projection.service';
import { TimelineActivityProjectionResolver } from 'src/engine/core-modules/timeline-feed/timeline-activity-projection.resolver';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [
    RelatedRecordIdsService,
    StaticTimelineProjectionPolicyProvider,
    TimelineActivityProjectionService,
    TimelineActivityProjectionResolver,
  ],
  exports: [RelatedRecordIdsService],
})
export class TimelineFeedModule {}
