import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TimelineCalendarEventParticipant } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event-participant.dto';

export enum TimelineCalendarEventVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
}

registerEnumType(TimelineCalendarEventVisibility, {
  name: 'TimelineCalendarEventVisibility',
  description: 'Visibility of the calendar event',
});

@ObjectType('LinkMetadata')
export class LinkMetadata {
  @Field()
  label: string;

  @Field()
  url: string;
}

@ObjectType('TimelineCalendarEvent')
export class TimelineCalendarEvent {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  title: string;

  @Field()
  isCanceled: boolean;

  @Field()
  isFullDay: boolean;

  @Field()
  startsAt: Date;

  @Field()
  endsAt: Date;

  @Field()
  description: string;

  @Field()
  location: string;

  @Field()
  conferenceSolution: string;

  @Field(() => LinkMetadata)
  conferenceLink: LinkMetadata;

  @Field(() => [TimelineCalendarEventParticipant])
  participants: TimelineCalendarEventParticipant[];

  @Field(() => TimelineCalendarEventVisibility)
  visibility: TimelineCalendarEventVisibility;
}
