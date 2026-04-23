import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TimelineCalendarEventParticipantDTO } from 'src/engine/core-modules/calendar/dtos/timeline-calendar-event-participant.dto';
import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

@ObjectType('LinkMetadata')
class LinkMetadataDTO {
  @Field()
  label: string;

  @Field()
  url: string;
}

@ObjectType('LinksMetadata')
export class LinksMetadataDTO {
  @Field()
  primaryLinkLabel: string;

  @Field()
  primaryLinkUrl: string;

  @Field(() => [LinkMetadataDTO], { nullable: true })
  secondaryLinks: LinkMetadataDTO[] | null;
}

@ObjectType('TimelineCalendarEvent')
export class TimelineCalendarEventDTO {
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

  @Field(() => LinksMetadataDTO)
  conferenceLink: LinksMetadataDTO;

  @Field(() => [TimelineCalendarEventParticipantDTO])
  participants: TimelineCalendarEventParticipantDTO[];

  @Field(() => CalendarChannelVisibility)
  visibility: CalendarChannelVisibility;
}
