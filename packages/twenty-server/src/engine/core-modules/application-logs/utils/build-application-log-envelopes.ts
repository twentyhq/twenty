import { formatDateTimeForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { type ApplicationLogEntry } from 'src/engine/core-modules/application-logs/interfaces/application-log-entry.interface';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';

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
