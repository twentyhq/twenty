import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { type AnchoredPeriodUnit } from 'src/engine/core-modules/usage-limit/types/anchored-period-unit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type QuotaOperationTypes } from 'src/engine/core-modules/usage-limit/types/quota-operation-types.type';

export type QuotaLimitDefaultDefinition<
  TResourceType extends UsageResourceType = UsageResourceType,
> = {
  resourceType: TResourceType;
  operationTypes: QuotaOperationTypes;
  limitKind: 'quota';
  spenderType: SpenderType;
  spenderId: '';
  isPerSpender: boolean;
  unit: UsageUnit;
  periodUnit: AnchoredPeriodUnit;
  periodCount: 1;
  limitValueConfigVariable: OptionalNumericConfigVariableKey;
  isOverridable: boolean;
};
