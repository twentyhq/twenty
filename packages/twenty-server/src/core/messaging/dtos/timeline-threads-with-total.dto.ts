import { Field, Int, ObjectType } from '@nestjs/graphql';

import { TimelineThread } from 'src/core/messaging/dtos/timeline-thread.dto';

@ObjectType('TimelineThreadsWithTotal')
export class TimelineThreadsWithTotal {
  @Field(() => Int)
  totalNumberOfThreads: number;

  @Field(() => [TimelineThread])
  timelineThreads: TimelineThread[];
}
