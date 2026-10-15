import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentMessageReactionSummary')
export class AgentMessageReactionSummaryDTO {
  @Field(() => String)
  emoji: string;

  // In the order the members reacted
  @Field(() => [UUIDScalarType])
  workspaceMemberIds: string[];
}
