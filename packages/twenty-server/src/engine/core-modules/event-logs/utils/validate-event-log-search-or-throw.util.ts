/* @license Enterprise */

import { type EventLogTable } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import {
  EventLogsException,
  EventLogsExceptionCode,
} from 'src/engine/core-modules/event-logs/event-logs.exception';
import { EVENT_LOG_TYPES } from 'src/engine/core-modules/event-logs/registry/event-log-registry';

export const validateEventLogSearchOrThrow = ({
  table,
}: {
  table: EventLogTable;
}): void => {
  if (!isNonEmptyArray(EVENT_LOG_TYPES[table].searchableFields)) {
    throw new EventLogsException(
      `Cannot search ${table} logs`,
      EventLogsExceptionCode.INVALID_SEARCH,
    );
  }
};
