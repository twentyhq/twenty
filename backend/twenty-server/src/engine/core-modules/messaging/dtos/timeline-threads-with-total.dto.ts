import { Field, Int, ObjectType } from '@nestjs/graphql';

import { TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';

@ObjectType('TimelineThreadsWithTotal')
export class TimelineThreadsWithTotalDTO {
  @Field(() => Int)
  totalNumberOfThreads: number;

  @Field(() => [TimelineThreadDTO])
  timelineThreads: TimelineThreadDTO[];
}
