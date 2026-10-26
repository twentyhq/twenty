import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatChannelSummary')
export class AgentChatChannelSummaryDTO {
  @Field(() => UUIDScalarType)
  channelId: string;

  @Field(() => Int)
  openCount: number;

  @Field(() => Int)
  assignedToMeCount: number;

  @Field(() => Int)
  snoozedCount: number;

  @Field(() => Int)
  doneCount: number;

  @Field(() => Boolean)
  hasUnreadOpen: boolean;

  @Field(() => Boolean)
  hasUnreadAssignedToMe: boolean;
}
