import { Field, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatMessagePart')
export class AgentChatMessagePartDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  messageId: string;

  @Field(() => Int)
  orderIndex: number;

  @Field()
  partType: string;

  @Field({ nullable: true })
  textContent?: string;

  @Field({ nullable: true })
  reasoningContent?: string;

  @Field({ nullable: true })
  reasoningIsThinking?: boolean;

  @Field({ nullable: true })
  toolName?: string;

  @Field({ nullable: true })
  toolCallId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  toolInput?: Record<string, unknown>;

  @Field(() => GraphQLJSON, { nullable: true })
  toolOutput?: Record<string, unknown>;

  @Field({ nullable: true })
  toolState?: string;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  errorDetails?: Record<string, unknown>;

  @Field({ nullable: true })
  sourceUrlUrl?: string;

  @Field({ nullable: true })
  sourceUrlDescription?: string;

  @Field({ nullable: true })
  sourceDocumentName?: string;

  @Field({ nullable: true })
  sourceDocumentContent?: string;

  @Field(() => Int, { nullable: true })
  sourceDocumentPage?: number;

  @Field()
  createdAt: Date;
}
