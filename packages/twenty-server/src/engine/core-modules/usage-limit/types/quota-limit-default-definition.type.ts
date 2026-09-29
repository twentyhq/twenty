import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type AnchoredPeriodUnit } from 'src/engine/core-modules/usage-limit/types/anchored-period-unit.type';
import { type QuotaMeter } from 'src/engine/core-modules/usage-limit/types/quota-meter.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export type QuotaLimitDefaultDefinition<
  TResourceType extends UsageResourceType = UsageResourceType,
> = {
  resourceType: TResourceType;
  operationType: UsageOperationType;
  limitKind: 'quota';
  spenderType: SpenderType;
  spenderId: '';
  meter: QuotaMeter;
  periodUnit: AnchoredPeriodUnit;
  periodCount: 1;
  limitValueConfigVariable: NumericConfigVariableKey;
  isOverridable: boolean;
};
