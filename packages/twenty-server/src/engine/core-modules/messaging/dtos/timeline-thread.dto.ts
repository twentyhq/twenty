import { ObjectType, Field, ID } from '@nestjs/graphql';

import { TimelineThreadParticipant } from 'src/engine/core-modules/messaging/dtos/timeline-thread-participant.dto';

@ObjectType('TimelineThread')
export class TimelineThread {
  @Field(() => ID)
  id: string;

  @Field()
  read: boolean;

  @Field()
  visibility: string;

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
