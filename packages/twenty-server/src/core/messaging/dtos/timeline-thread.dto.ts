import { ObjectType, Field, ID } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { TimelineThreadParticipant } from 'src/core/messaging/dtos/timeline-thread-participant.dto';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';

@ObjectType('TimelineThread')
export class TimelineThread {
  @IDField(() => ID)
  id: string;

  @Field()
  read: boolean;

  @FieldMetadata({
    type: FieldMetadataType.SELECT,
    label: 'Visibility',
    description: 'Visibility',
    icon: 'IconEyeglass',
    options: [
      { value: 'metadata', label: 'Metadata', position: 0, color: 'green' },
      { value: 'subject', label: 'Subject', position: 1, color: 'blue' },
      {
        value: 'share_everything',
        label: 'Share Everything',
        position: 2,
        color: 'orange',
      },
    ],
    defaultValue: { value: 'share_everything' },
  })
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
