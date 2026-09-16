import { Field, ObjectType } from '@nestjs/graphql';

import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

@ObjectType('UsageQuotaDefinition')
export class UsageQuotaDefinitionDTO {
  @Field(() => UsageResourceType)
  resourceType: UsageResourceType;

  @Field(() => String)
  limitKind: LimitKind;

  @Field(() => [UsageOperationType])
  allowedOperationTypes: UsageOperationType[];

  @Field(() => [String])
  allowedSpenderTypes: SpenderType[];

  @Field(() => [String])
  allowedMeters: UsageMeter[];
}
