import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatInboxThreadIds')
export class AgentChatInboxThreadIdsDTO {
  // Ordered by last activity, most recent first
  @Field(() => [UUIDScalarType])
  threadIds: string[];

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => String, { nullable: true })
  endCursor: string | null;
}
