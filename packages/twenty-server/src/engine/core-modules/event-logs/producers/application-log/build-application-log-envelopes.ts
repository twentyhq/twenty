import { formatDateTimeForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';

export const buildApplicationLogEnvelopes = (
  entries: ApplicationLogEntry[],
): WorkspaceEventEnvelope[] =>
  entries.map((entry) => ({
    table: 'applicationLog',
    row: {
      timestamp: formatDateTimeForClickHouse(entry.timestamp),
      workspaceId: entry.workspaceId,
      applicationId: entry.applicationId,
      logicFunctionId: entry.logicFunctionId,
      logicFunctionName: entry.logicFunctionName,
      executionId: entry.executionId,
      level: entry.level,
      message: entry.message,
    },
  }));
