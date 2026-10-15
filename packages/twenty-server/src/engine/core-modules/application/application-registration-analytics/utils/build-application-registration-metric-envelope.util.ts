import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { type ApplicationRegistrationMetricInput } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-input.type';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';

export const buildApplicationRegistrationMetricEnvelope = (
  input: ApplicationRegistrationMetricInput,
): WorkspaceEventEnvelope => ({
  table: 'applicationRegistrationMetric',
  row: {
    timestamp: formatDateTimeForClickHouse(input.timestamp ?? new Date()),
    applicationRegistrationId: input.applicationRegistrationId,
    universalIdentifier: input.universalIdentifier ?? '',
    version: input.version ?? '',
    metric: input.metric,
    dimension: input.dimension ?? '',
    context: input.context ?? '',
    workspaceHash: input.workspaceHash ?? '',
    value: input.value ?? 1,
  },
});
