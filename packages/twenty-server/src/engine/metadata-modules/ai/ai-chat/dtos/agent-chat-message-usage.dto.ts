import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('AgentChatMessageUsage')
export class AgentChatMessageUsageDTO {
  @Field(() => Int)
  inputTokens: number;

  @Field(() => Int)
  outputTokens: number;

  @Field(() => Int)
  cachedInputTokens: number;

  @Field(() => Float)
  inputCredits: number;

  @Field(() => Float)
  outputCredits: number;
}
