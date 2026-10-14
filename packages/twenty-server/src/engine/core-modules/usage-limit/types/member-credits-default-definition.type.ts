import { type OptionalNumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/optional-numeric-config-variable-key.type';
import { type CalendarPeriodUnit } from 'src/engine/core-modules/usage-limit/types/calendar-period-unit.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export type MemberCreditsDefaultDefinition = {
  limitValueConfigVariable: OptionalNumericConfigVariableKey;
  periodUnit: CalendarPeriodUnit;
  operationTypesByResourceType: Partial<
    Record<UsageResourceType, UsageOperationType[]>
  >;
};
