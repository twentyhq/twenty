import { Field, Int, ObjectType } from '@nestjs/graphql';

import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';

@ObjectType('GettingStartedStepReward')
export class GettingStartedStepRewardDTO {
  @Field(() => GettingStartedStep)
  step: GettingStartedStep;

  @Field(() => Number)
  creditsEach: number;

  @Field(() => Int)
  remainingCount: number;
}
