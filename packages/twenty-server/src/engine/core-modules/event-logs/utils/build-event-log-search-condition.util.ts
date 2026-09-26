/* @license Enterprise */

import { type EventLogTable } from 'twenty-shared/types';

import { EVENT_LOG_TYPES } from 'src/engine/core-modules/event-logs/registry/event-log-registry';
import { validateEventLogSearchOrThrow } from 'src/engine/core-modules/event-logs/utils/validate-event-log-search-or-throw.util';

export const buildEventLogSearchCondition = ({
  parameterName,
  table,
}: {
  parameterName: string;
  table: EventLogTable;
}): string => {
  validateEventLogSearchOrThrow({ table });

  const fieldConditions = EVENT_LOG_TYPES[table].searchableFields.map(
    (field) => {
      const quotedField = field
        .split('.')
        .map((fieldPathPart) => `"${fieldPathPart}"`)
        .join('.');

      return `toString(${quotedField}) ILIKE {${parameterName}:String}`;
    },
  );

  return `(${fieldConditions.join(' OR ')})`;
};
