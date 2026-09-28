import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { type CounterScope } from 'src/engine/core-modules/usage-limit/types/counter-scope.type';
import { type SpeedMeter } from 'src/engine/core-modules/usage-limit/types/speed-meter.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export type SpeedLimitDefaultDefinition<
  TResourceType extends UsageResourceType = UsageResourceType,
> = {
  resourceType: TResourceType;
  operationType: UsageOperationType;
  limitKind: 'speed';
  spenderType: SpenderType;
  spenderId: '';
  meter: SpeedMeter;
  periodUnit: 'second';
  windowMsConfigVariable: NumericConfigVariableKey;
  limitValueConfigVariable: NumericConfigVariableKey;
  counterScope: CounterScope;
  isOverridable: boolean;
};
