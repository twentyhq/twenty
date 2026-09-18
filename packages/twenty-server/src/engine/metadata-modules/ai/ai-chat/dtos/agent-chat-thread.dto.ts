import { Field, Float, HideField, ID, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentChatThreadStatus } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-thread-status.enum';

@ObjectType('AgentChatThread')
export class AgentChatThreadDTO {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title: string;

  @Field(() => UUIDScalarType, { nullable: true })
  channelId: string | null;

  // The creator keeps the owner role for the life of the thread.
  @Field(() => UUIDScalarType)
  ownerUserWorkspaceId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  workflowRunId: string | null;

  @Field(() => String, { nullable: true })
  workflowStepId: string | null;

  @Field(() => Int)
  totalCacheReadTokens: number;

  @Field(() => Int)
  totalInputTokens: number;

  @Field(() => Int)
  totalOutputTokens: number;

  @Field(() => Int, { nullable: true })
  contextWindowTokens: number | null;

  @Field(() => Int)
  conversationSize: number;

  // Credits are converted from internal precision to display precision
  // (internal / 1000) at the resolver level
  @Field(() => Float)
  totalInputCredits: number;

  @Field(() => Float)
  totalOutputCredits: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => AgentChatThreadStatus)
  status: AgentChatThreadStatus;

  @Field(() => Date, { nullable: true })
  snoozedUntil: Date | null;

  @Field(() => UUIDScalarType, { nullable: true })
  assigneeUserWorkspaceId: string | null;

  @Field(() => Date, { nullable: true })
  deletedAt: Date | null;

  @Field(() => Date, { nullable: true })
  lastMessageAt: Date | null;

  @Field(() => String, { nullable: true })
  lastMessagePreview: string | null;

  @Field(() => String, { nullable: true })
  lastMessageRole: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  lastMessageAuthorUserWorkspaceId: string | null;

  @HideField()
  userWorkspaceId: string;
}
