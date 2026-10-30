import { Field, ObjectType } from '@nestjs/graphql';

import { GettingStartedStepKind } from 'src/engine/core-modules/getting-started/enums/getting-started-step-kind.enum';
import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';

@ObjectType('GettingStartedStepDefinition')
export class GettingStartedStepDefinitionDTO {
  @Field(() => GettingStartedStepActionKey)
  actionKey: GettingStartedStepActionKey;

  @Field(() => GettingStartedStepKind)
  kind: GettingStartedStepKind;

  @Field(() => String)
  title: string;

  @Field(() => String)
  doneTitle: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  icon: string;

  @Field(() => String)
  iconColor: string;

  @Field(() => String, { nullable: true })
  promptLabel: string | null;

  @Field(() => String, { nullable: true })
  prompt: string | null;
}
