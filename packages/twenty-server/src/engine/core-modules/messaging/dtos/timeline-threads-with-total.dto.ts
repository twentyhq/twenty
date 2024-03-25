import { Field, Int, ObjectType } from '@nestjs/graphql';

import { TimelineThread } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';

@ObjectType('TimelineThreadsWithTotal')
export class TimelineThreadsWithTotal {
  @Field(() => Int)
  totalNumberOfThreads: number;

  @Field(() => [TimelineThread])
  timelineThreads: TimelineThread[];
}
