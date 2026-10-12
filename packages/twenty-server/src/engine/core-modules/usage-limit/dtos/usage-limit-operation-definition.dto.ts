import { Field, ObjectType } from '@nestjs/graphql';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

@ObjectType('UsageLimitOperationDefinition')
export class UsageLimitOperationDefinitionDTO {
  @Field(() => UsageOperationType)
  operationType: UsageOperationType;

  @Field(() => [UsageUnit])
  allowedUnits: UsageUnit[];
}
