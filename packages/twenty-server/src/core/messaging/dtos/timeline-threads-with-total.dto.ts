import { ObjectType } from '@nestjs/graphql';

import { TimelineThread } from 'src/core/messaging/dtos/timeline-thread.dto';

@ObjectType('TimelineThreadsWithTotal')
export class TimelineThreadsWithTotal {
  totalNumberOfThreads: number;
  timelineThreads: TimelineThread[];
}
