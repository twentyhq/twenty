import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type CounterScope } from 'src/engine/core-modules/usage-limit/types/counter-scope.type';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export type UsageLimitDefault = {
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  limitKind: LimitKind;
  spenderType: SpenderType;
  meter: UsageMeter;
  isOverridable: boolean;
  limitValueConfigVariable: NumericConfigVariableKey;
  windowMsConfigVariable: NumericConfigVariableKey | null;
  counterScope: CounterScope | null;
};
