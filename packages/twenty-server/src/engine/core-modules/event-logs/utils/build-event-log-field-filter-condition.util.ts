/* @license Enterprise */

import { type EventLogTable } from 'twenty-shared/types';

import { type EventLogFieldFilterInput } from 'src/engine/core-modules/event-logs/dtos/event-log-field-filter.input';
import { EventLogFilterOperand } from 'src/engine/core-modules/event-logs/dtos/event-log-filter-operand.enum';
import { validateEventLogFieldFilterOrThrow } from 'src/engine/core-modules/event-logs/utils/validate-event-log-field-filter-or-throw.util';

export const buildEventLogFieldFilterCondition = ({
  fieldFilter,
  parameterName,
  table,
  validateValuesCount = true,
}: {
  fieldFilter: EventLogFieldFilterInput;
  parameterName: string;
  table: EventLogTable;
  validateValuesCount?: boolean;
}): string => {
  validateEventLogFieldFilterOrThrow({
    fieldFilter,
    table,
    validateValuesCount,
  });

  const operator =
    fieldFilter.operand === EventLogFilterOperand.IS ? 'IN' : 'NOT IN';

  const expression =
    fieldFilter.field === 'functionOrEvent'
      ? `if(empty("logicFunctionId"), concat('event:', "logicFunctionName"), "logicFunctionId")`
      : `"${fieldFilter.field}"`;
  return `${expression} ${operator} {${parameterName}:Array(String)}`;
};
