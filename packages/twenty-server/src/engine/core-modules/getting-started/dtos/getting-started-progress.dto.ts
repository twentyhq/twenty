import { Field, ObjectType } from '@nestjs/graphql';

import { GettingStartedStepDefinitionDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-step-definition.dto';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';

@ObjectType('GettingStartedProgress')
export class GettingStartedProgressDTO {
  @Field(() => [GettingStartedStepDefinitionDTO])
  steps: GettingStartedStepDefinitionDTO[];

  @Field(() => [GettingStartedStep])
  completedSteps: GettingStartedStep[];

  @Field(() => GettingStartedStep, { nullable: true })
  selectedStep: GettingStartedStep | null;

  @Field(() => String, { nullable: true })
  snoozedUntil: string | null;

  @Field(() => Boolean)
  isHidden: boolean;
}
