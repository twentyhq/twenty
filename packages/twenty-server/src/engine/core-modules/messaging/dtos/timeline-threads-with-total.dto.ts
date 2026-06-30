import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';

@ObjectType('TimelineThreadsWithTotal')
export class TimelineThreadsWithTotalDTO {
  @Field(() => Int)
  totalNumberOfThreads: number;

  @Field(() => [TimelineThreadDTO])
  timelineThreads: TimelineThreadDTO[];

  @Field(() => [UUIDScalarType])
  relatedPersonIds: string[];
}
