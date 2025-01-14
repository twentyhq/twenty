import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TrialPeriod {
  @Field(() => Number)
  duration: number;

  @Field(() => Boolean)
  isCreditCardRequired: boolean;
}
