import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { type AnchoredPeriodUnit } from 'src/engine/core-modules/usage-limit/types/anchored-period-unit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

type QuotaLimitDefaultOperationScope =
  | { operationType: UsageOperationType; isOverridable: true }
  | { operationType: UsageOperationType[]; isOverridable: false };

export type QuotaLimitDefaultDefinition<
  TResourceType extends UsageResourceType = UsageResourceType,
> = QuotaLimitDefaultOperationScope & {
  resourceType: TResourceType;
  limitKind: 'quota';
  spenderType: SpenderType;
  spenderId: '';
  isPerSpender: boolean;
  unit: UsageUnit;
  periodUnit: AnchoredPeriodUnit;
  periodCount: 1;
  limitValueConfigVariable: OptionalNumericConfigVariableKey;
};
