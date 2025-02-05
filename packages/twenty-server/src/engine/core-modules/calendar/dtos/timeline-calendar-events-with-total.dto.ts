import { Field, Int, ObjectType } from '@nestjs/graphql';

import { TimelineCalendarEvent } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event.dto';

@ObjectType()
export class TimelineCalendarEventsWithTotal {
  @Field(() => Int)
  totalNumberOfCalendarEvents: number;

  @Field(() => [TimelineCalendarEvent])
  timelineCalendarEvents: TimelineCalendarEvent[];
}
