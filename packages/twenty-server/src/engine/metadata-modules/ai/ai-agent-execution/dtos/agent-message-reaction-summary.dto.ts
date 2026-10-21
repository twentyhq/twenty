import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentMessageReactionSummary')
export class AgentMessageReactionSummaryDTO {
  @Field(() => String)
  emoji: string;

  @Field(() => [UUIDScalarType])
  workspaceMemberIds: string[];

  @Field(() => [UUIDScalarType])
  agentIds: string[];

  @Field(() => Boolean)
  hasAssistantReacted: boolean;
}
