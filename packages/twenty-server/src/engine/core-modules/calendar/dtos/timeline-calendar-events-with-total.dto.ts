import { Field, Int, ObjectType } from '@nestjs/graphql';

import { TimelineCalendarEventDTO } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event.dto';

@ObjectType('TimelineCalendarEventsWithTotal')
export class TimelineCalendarEventsWithTotalDTO {
  @Field(() => Int)
  totalNumberOfCalendarEvents: number;

  @Field(() => [TimelineCalendarEventDTO])
  timelineCalendarEvents: TimelineCalendarEventDTO[];
}
