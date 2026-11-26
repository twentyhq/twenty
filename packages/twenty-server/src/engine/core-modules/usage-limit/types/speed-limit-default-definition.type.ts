import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type CounterScope } from 'src/engine/core-modules/usage-limit/types/counter-scope.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

// A fixed window keeps the limit meaning "N per window"; operators then only change N
type SpeedLimitWindow =
  | { windowMsConfigVariable: NumericConfigVariableKey }
  | { windowSeconds: number };

export type SpeedLimitDefaultDefinition<
  TResourceType extends UsageResourceType = UsageResourceType,
> = SpeedLimitWindow & {
  resourceType: TResourceType;
  operationType: UsageOperationType;
  limitKind: 'speed';
  spenderType: SpenderType;
  spenderId: '';
  unit: UsageUnit;
  periodUnit: 'second';
  limitValueConfigVariable: NumericConfigVariableKey;
  counterScope: CounterScope;
  isOverridable: boolean;
};
