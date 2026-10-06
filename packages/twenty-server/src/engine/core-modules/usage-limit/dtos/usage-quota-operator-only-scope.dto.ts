import { Field, ObjectType } from '@nestjs/graphql';

import { type AnchoredPeriodUnit } from 'src/engine/core-modules/usage-limit/types/anchored-period-unit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

@ObjectType('UsageQuotaOperatorOnlyScope')
export class UsageQuotaOperatorOnlyScopeDTO {
  @Field(() => UsageOperationType)
  operationType: UsageOperationType;

  @Field(() => String)
  spenderType: SpenderType;

  @Field(() => UsageUnit)
  unit: UsageUnit;

  @Field(() => String)
  periodUnit: AnchoredPeriodUnit;
}
