import { Field, ObjectType } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { GettingStartedStepKind } from 'src/engine/core-modules/getting-started/enums/getting-started-step-kind.enum';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';

@ObjectType('GettingStartedStepDefinition')
export class GettingStartedStepDefinitionDTO {
  @Field(() => GettingStartedStep)
  key: GettingStartedStep;

  @Field(() => GettingStartedStepKind)
  kind: GettingStartedStepKind;

  @Field(() => PermissionFlagType)
  permissionFlag: PermissionFlagType;
}
