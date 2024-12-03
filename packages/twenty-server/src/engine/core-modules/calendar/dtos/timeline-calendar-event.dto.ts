import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TimelineCalendarEventParticipant } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event-participant.dto';
import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

@ObjectType('LinkMetadata')
class LinkMetadata {
  @Field()
  label: string;

  @Field()
  url: string;
}

@ObjectType('LinksMetadata')
export class LinksMetadata {
  @Field()
  primaryLinkLabel: string;

  @Field()
  primaryLinkUrl: string;

  @Field(() => [LinkMetadata], { nullable: true })
  secondaryLinks: LinkMetadata[] | null;
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

  @Field(() => LinksMetadata)
  conferenceLink: LinksMetadata;

  @Field(() => [TimelineCalendarEventParticipant])
  participants: TimelineCalendarEventParticipant[];

  @Field(() => CalendarChannelVisibility)
  visibility: CalendarChannelVisibility;
}
