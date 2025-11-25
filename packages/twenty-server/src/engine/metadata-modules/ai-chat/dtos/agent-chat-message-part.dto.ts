import { Field, Int, ObjectType } from '@nestjs/graphql';

import { JSONValue } from 'ai';
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

  @Field(() => GraphQLJSON, { nullable: true })
  errorDetails?: Record<string, unknown>;

  @Field({ nullable: true })
  sourceUrlSourceId?: string;

  @Field({ nullable: true })
  sourceUrlUrl?: string;

  @Field({ nullable: true })
  sourceUrlTitle?: string;

  @Field({ nullable: true })
  sourceDocumentSourceId?: string;

  @Field({ nullable: true })
  sourceDocumentMediaType?: string;

  @Field({ nullable: true })
  sourceDocumentTitle?: string;

  @Field({ nullable: true })
  sourceDocumentFilename?: string;

  @Field({ nullable: true })
  fileMediaType?: string;

  @Field({ nullable: true })
  fileFilename?: string;

  @Field({ nullable: true })
  fileUrl?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  providerMetadata?: Record<string, Record<string, JSONValue>>;

  @Field()
  createdAt: Date;
}
