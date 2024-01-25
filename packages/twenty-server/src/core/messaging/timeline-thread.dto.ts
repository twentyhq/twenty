import { ObjectType, Field } from '@nestjs/graphql';

import { Entity } from 'typeorm';

import { TimelineThreadParticipant } from 'src/core/messaging/timeline-thread-participant.dto';

@Entity({ name: 'timelineThread', schema: 'core' })
@ObjectType('TimelineThread')
export class TimelineThread {
  @Field()
  id: string;

  @Field()
  read: boolean;

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
