/* @license Enterprise */

import { type EventLogTable } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type EventLogFieldFilterInput } from 'src/engine/core-modules/event-logs/dtos/event-log-field-filter.input';
import { EventLogFilterOperand } from 'src/engine/core-modules/event-logs/dtos/event-log-filter-operand.enum';
import {
  EventLogsException,
  EventLogsExceptionCode,
} from 'src/engine/core-modules/event-logs/event-logs.exception';
import { EVENT_LOG_TYPES } from 'src/engine/core-modules/event-logs/registry/event-log-registry';

const MAX_FIELD_FILTER_VALUES = 100;

export const buildEventLogFieldFilterCondition = ({
  fieldFilter,
  parameterName,
  table,
}: {
  fieldFilter: EventLogFieldFilterInput;
  parameterName: string;
  table: EventLogTable;
}): string => {
  const { filterableFields } = EVENT_LOG_TYPES[table];

  if (!filterableFields.includes(fieldFilter.field)) {
    throw new EventLogsException(
      `Cannot filter ${table} logs by "${fieldFilter.field}". Filterable fields: ${filterableFields.join(', ')}`,
      EventLogsExceptionCode.INVALID_FIELD_FILTER,
    );
  }

  if (
    !isNonEmptyArray(fieldFilter.values) ||
    fieldFilter.values.length > MAX_FIELD_FILTER_VALUES
  ) {
    throw new EventLogsException(
      `Filter on "${fieldFilter.field}" needs between 1 and ${MAX_FIELD_FILTER_VALUES} values`,
      EventLogsExceptionCode.INVALID_FIELD_FILTER,
    );
  }

  const operator =
    fieldFilter.operand === EventLogFilterOperand.IS ? 'IN' : 'NOT IN';

  return `"${fieldFilter.field}" ${operator} {${parameterName}:Array(String)}`;
};
