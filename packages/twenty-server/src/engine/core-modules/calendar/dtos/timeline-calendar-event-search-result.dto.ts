import { Field, ObjectType } from '@nestjs/graphql';

import { TimelineCalendarEventDTO } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event.dto';

@ObjectType('TimelineCalendarEventSearchResult')
export class TimelineCalendarEventSearchResultDTO {
  @Field(() => [TimelineCalendarEventDTO])
  recordTimelineCalendarEvents: TimelineCalendarEventDTO[];

  @Field(() => [TimelineCalendarEventDTO])
  otherTimelineCalendarEvents: TimelineCalendarEventDTO[];
}
