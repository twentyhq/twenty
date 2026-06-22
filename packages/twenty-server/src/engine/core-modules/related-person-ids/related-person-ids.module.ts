import { Module } from '@nestjs/common';

import { RelatedPersonIdsService } from 'src/engine/core-modules/related-person-ids/services/related-person-ids.service';
import { TimelineFeedModule } from 'src/engine/core-modules/timeline-feed/timeline-feed.module';

@Module({
  imports: [TimelineFeedModule],
  providers: [RelatedPersonIdsService],
  exports: [RelatedPersonIdsService],
})
export class RelatedPersonIdsModule {}
