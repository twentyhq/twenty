import { Field, ObjectType } from '@nestjs/graphql';

import { type AgentChatThreadRowMetadata } from 'twenty-shared/ai';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatThreadRowMetadata')
export class AgentChatThreadRowMetadataDTO implements AgentChatThreadRowMetadata {
  @Field(() => UUIDScalarType)
  threadId: string;

  @Field(() => String, { nullable: true })
  activityAt: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  pendingQuestionMessageId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  messageId: string | null;

  @Field(() => String, { nullable: true })
  previewText: string | null;

  @Field(() => String)
  senderType: AgentChatThreadRowMetadata['senderType'];

  @Field(() => UUIDScalarType, { nullable: true })
  senderId: string | null;

  @Field(() => String, { nullable: true })
  senderName: string | null;

  @Field(() => String, { nullable: true })
  executionOutcome: AgentChatThreadRowMetadata['executionOutcome'];
}
