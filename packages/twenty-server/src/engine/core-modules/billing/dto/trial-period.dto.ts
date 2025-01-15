import { Field, ObjectType } from '@nestjs/graphql';

import { Min } from 'class-validator';

@ObjectType()
export class TrialPeriodDTO {
  @Field(() => Number)
  @Min(0)
  duration: number;

  @Field(() => Boolean)
  isCreditCardRequired: boolean;
}
