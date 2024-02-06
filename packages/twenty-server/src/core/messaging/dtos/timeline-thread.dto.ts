import { ObjectType, Field, ID } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { IsEnum } from 'class-validator';

import { TimelineThreadParticipant } from 'src/core/messaging/dtos/timeline-thread-participant.dto';

@ObjectType('TimelineThread')
export class TimelineThread {
  @IDField(() => ID)
  id: string;

  @Field()
  read: boolean;

  @Field()
  @IsEnum(['metadata', 'subject', 'share_everything'])
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
