/* @license Enterprise */

import { type EventLogTable } from 'twenty-shared/types';

import { type EventLogFieldFilterInput } from 'src/engine/core-modules/event-logs/dtos/event-log-field-filter.input';
import { EventLogFilterOperand } from 'src/engine/core-modules/event-logs/dtos/event-log-filter-operand.enum';
import { validateEventLogFieldFilterOrThrow } from 'src/engine/core-modules/event-logs/utils/validate-event-log-field-filter-or-throw.util';

export const buildEventLogFieldFilterCondition = ({
  fieldFilter,
  parameterName,
  table,
}: {
  fieldFilter: EventLogFieldFilterInput;
  parameterName: string;
  table: EventLogTable;
}): string => {
  validateEventLogFieldFilterOrThrow({ fieldFilter, table });

  const operator =
    fieldFilter.operand === EventLogFilterOperand.IS ? 'IN' : 'NOT IN';

  return `"${fieldFilter.field}" ${operator} {${parameterName}:Array(String)}`;
};
