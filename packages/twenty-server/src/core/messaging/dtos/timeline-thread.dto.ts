import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { TimelineThreadParticipant } from 'src/core/messaging/dtos/timeline-thread-participant.dto';
import { TimelineThreadVisibility } from 'src/core/messaging/dtos/timeline-thread-visibility.dto';

registerEnumType(TimelineThreadVisibility, {
  name: 'TimelineThreadVisibility',
  description: 'Visibility of the thread',
});

@ObjectType('TimelineThread')
export class TimelineThread {
  @IDField(() => ID)
  id: string;

  @Field()
  read: boolean;

  @Field()
  visibility: TimelineThreadVisibility;

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
