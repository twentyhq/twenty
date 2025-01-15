import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TrialPeriodDTO {
  @Field(() => Number)
  duration: number;

  @Field(() => Boolean)
  isCreditCardRequired: boolean;
}
