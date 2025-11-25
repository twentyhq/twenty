import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

import { AgentMessagePartDTO } from './agent-message-part.dto';

@ObjectType('AgentMessage')
export class AgentMessageDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  threadId: string;

  @Field(() => UUIDScalarType)
  turnId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  agentId: string | null;

  @Field()
  role: 'user' | 'assistant';

  @Field(() => [AgentMessagePartDTO])
  parts: AgentMessagePartDTO[];

  @Field()
  createdAt: Date;
}

