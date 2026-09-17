import { Field, Float, HideField, ID, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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

  @Field(() => Date, { nullable: true })
  deletedAt: Date | null;

  @Field(() => Date, { nullable: true })
  lastMessageAt: Date | null;

  @HideField()
  userWorkspaceId: string;
}
