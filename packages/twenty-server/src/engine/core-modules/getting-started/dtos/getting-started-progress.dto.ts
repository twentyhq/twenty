import { Field, ObjectType } from '@nestjs/graphql';

import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';

@ObjectType('GettingStartedProgress')
export class GettingStartedProgressDTO {
  @Field(() => Number)
  creditsEarned: number;

  @Field(() => [GettingStartedStep])
  steps: GettingStartedStep[];

  @Field(() => [GettingStartedStep])
  completedSteps: GettingStartedStep[];

  @Field(() => GettingStartedStep, { nullable: true })
  selectedStep: GettingStartedStep | null;

  @Field(() => String, { nullable: true })
  snoozedUntil: string | null;

  @Field(() => Boolean)
  isHidden: boolean;
}
