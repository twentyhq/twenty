import { isNonEmptyString } from '@sniptt/guards';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { type ApplicationMetricEvent } from 'src/engine/core-modules/event-logs/producers/application-metric-event/application-metric-event.type';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';

export const buildApplicationMetricEventEnvelopes = (
  events: ApplicationMetricEvent[],
): WorkspaceEventEnvelope[] =>
  events
    .filter((event) => isNonEmptyString(event.applicationRegistrationId))
    .map((event) => ({
      table: 'applicationMetricEvent',
      row: {
        ...event,
        timestamp: formatDateTimeForClickHouse(event.timestamp),
        durationMs: Math.max(0, Math.round(event.durationMs)),
      },
    }));
