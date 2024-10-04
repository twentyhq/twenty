import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TimelineThreadParticipant } from 'src/engine/core-modules/messaging/dtos/timeline-thread-participant.dto';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@ObjectType('TimelineThread')
export class TimelineThread {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  read: boolean;

  @Field(() => MessageChannelVisibility)
  visibility: MessageChannelVisibility;

  @Field()
  firstParticipant: TimelineThreadParticipant;

  @Field(() => [TimelineThreadParticipant])
  lastTwoParticipants: TimelineThreadParticipant[];

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
