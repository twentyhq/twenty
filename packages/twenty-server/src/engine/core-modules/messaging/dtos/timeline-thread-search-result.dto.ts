import { Field, ObjectType } from '@nestjs/graphql';

import { TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';

@ObjectType('TimelineThreadSearchResult')
export class TimelineThreadSearchResultDTO {
  @Field(() => [TimelineThreadDTO])
  recordTimelineThreads: TimelineThreadDTO[];

  @Field(() => [TimelineThreadDTO])
  otherTimelineThreads: TimelineThreadDTO[];
}
