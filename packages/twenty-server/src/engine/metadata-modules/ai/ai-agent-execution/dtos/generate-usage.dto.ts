import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('GenerateUsage')
export class GenerateUsageDTO {
  @Field(() => Int)
  inputTokens: number;

  @Field(() => Int)
  outputTokens: number;
}
