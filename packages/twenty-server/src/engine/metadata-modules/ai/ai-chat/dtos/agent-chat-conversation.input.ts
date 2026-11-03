import { ArgsType, Field } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// a member names a thread by id; an application names its own conversation as it passes it to runAgent
@ArgsType()
export class AgentChatConversationInput {
  @Field(() => UUIDScalarType, { nullable: true })
  threadId?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  agentUniversalIdentifier?: string | null;

  @Field(() => String, { nullable: true })
  threadKey?: string | null;
}
