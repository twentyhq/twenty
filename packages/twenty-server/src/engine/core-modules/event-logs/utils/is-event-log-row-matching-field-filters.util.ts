/* @license Enterprise */

import { type EventLogFieldFilterInput } from 'src/engine/core-modules/event-logs/dtos/event-log-field-filter.input';
import { EventLogFilterOperand } from 'src/engine/core-modules/event-logs/dtos/event-log-filter-operand.enum';

export const isEventLogRowMatchingFieldFilters = ({
  row,
  fieldFilters,
}: {
  row: Record<string, unknown>;
  fieldFilters: EventLogFieldFilterInput[];
}): boolean =>
  fieldFilters.every(({ field, operand, values }) => {
    const isValueIncluded = values.includes(String(row[field] ?? ''));

    return operand === EventLogFilterOperand.IS
      ? isValueIncluded
      : !isValueIncluded;
  });
