import { ObjectType, Field } from '@nestjs/graphql';

import { Entity } from 'typeorm';

@Entity({ name: 'timelineThreadParticipant', schema: 'core' })
@ObjectType('TimelineThreadParticipant')
export class TimelineThreadParticipant {
  @Field({ nullable: true })
  personId: string;

  @Field({ nullable: true })
  workspaceMemberId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  displayName: string;

  @Field()
  avatarUrl: string;

  @Field()
  handle: string;
}
