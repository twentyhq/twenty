import { EventLogTable } from 'twenty-shared/types';

import { type EventLogRecord } from 'src/engine/core-modules/event-logs/dtos/event-log-result.dto';
import { EVENT_LOG_TYPES } from 'src/engine/core-modules/event-logs/registry/event-log-registry';

export const normalizeEventLogRecords = (
  records: Record<string, unknown>[],
  table: EventLogTable,
): EventLogRecord[] => records.map(EVENT_LOG_TYPES[table].normalize);
