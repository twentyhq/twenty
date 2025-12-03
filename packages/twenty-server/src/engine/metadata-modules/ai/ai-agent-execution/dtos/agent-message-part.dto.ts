import { Field, Int, ObjectType } from '@nestjs/graphql';

import { IsDateString } from 'class-validator';
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

  @Field(() => String, { nullable: true })
  textContent: string | null;

  @Field(() => String, { nullable: true })
  reasoningContent: string | null;

  @Field(() => String, { nullable: true })
  toolName: string | null;

  @Field(() => String, { nullable: true })
  toolCallId: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  toolInput: unknown | null;

  @Field(() => GraphQLJSON, { nullable: true })
  toolOutput: unknown | null;

  @Field(() => String, { nullable: true })
  state: string | null;

  @Field(() => String, { nullable: true })
  errorMessage: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  errorDetails: Record<string, unknown> | null;

  @Field(() => String, { nullable: true })
  sourceUrlSourceId: string | null;

  @Field(() => String, { nullable: true })
  sourceUrlUrl: string | null;

  @Field(() => String, { nullable: true })
  sourceUrlTitle: string | null;

  @Field(() => String, { nullable: true })
  sourceDocumentSourceId: string | null;

  @Field(() => String, { nullable: true })
  sourceDocumentMediaType: string | null;

  @Field(() => String, { nullable: true })
  sourceDocumentTitle: string | null;

  @Field(() => String, { nullable: true })
  sourceDocumentFilename: string | null;

  @Field(() => String, { nullable: true })
  fileMediaType: string | null;

  @Field(() => String, { nullable: true })
  fileFilename: string | null;

  @Field(() => String, { nullable: true })
  fileUrl: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  providerMetadata: Record<string, unknown> | null;

  @IsDateString()
  @Field()
  createdAt: Date;
}
