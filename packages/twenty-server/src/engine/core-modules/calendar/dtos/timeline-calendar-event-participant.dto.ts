import { ObjectType, Field } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('TimelineCalendarEventParticipant')
export class TimelineCalendarEventParticipant {
  @Field(() => UUIDScalarType, { nullable: true })
  personId: string;

  @Field(() => UUIDScalarType, { nullable: true })
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
