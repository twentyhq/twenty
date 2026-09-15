import { Field, Float, HideField, ID, Int, ObjectType } from '@nestjs/graphql';

import { AgentChatMessageUsageDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-message-usage.dto';

@ObjectType('AgentChatThread')
export class AgentChatThreadDTO {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title: string;

  @Field(() => AgentChatMessageUsageDTO, { nullable: true })
  lastMessageUsage: AgentChatMessageUsageDTO | null;

  @Field(() => Float, { nullable: true })
  totalCacheReadTokens: number | null;

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

  @Field(() => Date, { nullable: true })
  deletedAt: Date | null;

  @Field(() => Date, { nullable: true })
  lastMessageAt: Date | null;

  @HideField()
  userWorkspaceId: string;
}
