import { Field, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentMessagePart')
export class AgentMessagePartDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  messageId: string;

  @Field(() => Int)
  orderIndex: number;

  @Field()
  type: string;

  @Field({ nullable: true })
  textContent?: string;

  @Field({ nullable: true })
  reasoningContent?: string;

  @Field({ nullable: true })
  toolName?: string;

  @Field({ nullable: true })
  toolCallId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  toolInput?: Record<string, unknown>;

  @Field(() => GraphQLJSON, { nullable: true })
  toolOutput?: Record<string, unknown>;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field()
  createdAt: Date;
}
