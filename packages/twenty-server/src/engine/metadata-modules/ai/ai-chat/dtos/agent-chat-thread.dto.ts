import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('AgentChatThread')
export class AgentChatThreadDTO {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  title: string;

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

  // In display credits; the resolver converts from the stored internal credits
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
}
