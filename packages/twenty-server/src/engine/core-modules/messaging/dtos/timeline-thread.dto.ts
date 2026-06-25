import { Field, ObjectType } from '@nestjs/graphql';

import { MessageChannelVisibility } from 'twenty-shared/types';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TimelineThreadParticipantDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread-participant.dto';

@ObjectType('TimelineThread')
export class TimelineThreadDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  read: boolean;

  @Field(() => MessageChannelVisibility)
  visibility: MessageChannelVisibility;

  @Field()
  firstParticipant: TimelineThreadParticipantDTO;

  @Field(() => [TimelineThreadParticipantDTO])
  lastTwoParticipants: TimelineThreadParticipantDTO[];

  @Field()
  lastMessageReceivedAt: Date;

  @Field()
  lastMessageBody: string;

  @Field()
  subject: string;

  @Field()
  numberOfMessagesInThread: number;

  @Field()
  participantCount: number;
}
