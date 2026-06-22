import { Module } from '@nestjs/common';

import { RelatedRecordIdsService } from 'src/engine/core-modules/timeline-feed/projection/services/related-record-ids.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [RelatedRecordIdsService],
  exports: [RelatedRecordIdsService],
})
export class TimelineFeedModule {}
