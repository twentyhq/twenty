import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TimelineCalendarEventDTO } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event.dto';

@ObjectType('TimelineCalendarEventsWithTotal')
export class TimelineCalendarEventsWithTotalDTO {
  @Field(() => Int)
  totalNumberOfCalendarEvents: number;

  @Field(() => [TimelineCalendarEventDTO])
  timelineCalendarEvents: TimelineCalendarEventDTO[];

  @Field(() => [UUIDScalarType])
  relatedPersonIds: string[];
}
