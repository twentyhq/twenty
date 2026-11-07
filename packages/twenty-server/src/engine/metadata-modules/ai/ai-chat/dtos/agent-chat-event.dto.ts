import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

// Typed as JSON because the payload is AgentChatSubscriptionEvent
// (a discriminated union defined in twenty-shared).
@ObjectType('AgentChatEvent')
export class AgentChatEventDTO {
  @Field(() => String, { nullable: true })
  threadId: string | null;

  @Field(() => GraphQLJSON)
  event: Record<string, unknown>;
}
