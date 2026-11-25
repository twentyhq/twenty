import { Field, Int, ObjectType } from '@nestjs/graphql';

import { type AiRunUsage } from 'twenty-shared/application';

@ObjectType('AiRunUsage')
export class AiRunUsageDTO implements AiRunUsage {
  @Field(() => Int)
  inputTokens: number;

  @Field(() => Int)
  outputTokens: number;
}
