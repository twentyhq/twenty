import { Field, ObjectType } from '@nestjs/graphql';

import { GettingStartedStepDefinitionDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-step-definition.dto';
import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';

@ObjectType('GettingStartedProgress')
export class GettingStartedProgressDTO {
  @Field(() => [GettingStartedStepDefinitionDTO])
  steps: GettingStartedStepDefinitionDTO[];

  @Field(() => [GettingStartedStepActionKey])
  completedStepActionKeys: GettingStartedStepActionKey[];

  @Field(() => GettingStartedStepActionKey, { nullable: true })
  selectedStepActionKey: GettingStartedStepActionKey | null;

  @Field(() => String, { nullable: true })
  snoozedUntil: string | null;

  @Field(() => Boolean)
  isHidden: boolean;
}
