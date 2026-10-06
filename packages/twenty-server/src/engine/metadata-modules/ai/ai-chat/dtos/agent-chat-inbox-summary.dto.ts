import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatInboxChannelSummary')
export class AgentChatInboxChannelSummaryDTO {
  @Field(() => UUIDScalarType)
  channelId: string;

  @Field(() => Int)
  openCount: number;

  @Field(() => Boolean)
  hasUnreadOpen: boolean;
}

@ObjectType('AgentChatInboxSummary')
export class AgentChatInboxSummaryDTO {
  @Field(() => Int)
  openCount: number;

  @Field(() => Boolean)
  hasUnreadOpen: boolean;

  @Field(() => Int)
  needsInputCount: number;

  @Field(() => Boolean)
  hasUnreadMention: boolean;

  @Field(() => Boolean)
  hasUnreadAssigned: boolean;

  // One per channel the member joined
  @Field(() => [AgentChatInboxChannelSummaryDTO])
  channels: AgentChatInboxChannelSummaryDTO[];
}
