import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { type ApplicationMetricEvent } from 'src/engine/core-modules/event-logs/producers/application-metric-event/application-metric-event.type';

export const toApplicationMetricEvent = (
  entry: ApplicationLogEntry,
): ApplicationMetricEvent => ({
  timestamp: entry.timestamp,
  applicationRegistrationId: entry.applicationRegistrationId,
  workspaceId: entry.workspaceId,
  applicationId: entry.applicationId,
  applicationVersion: entry.applicationVersion,
  source: entry.source,
  logicFunctionId: entry.logicFunctionId,
  logicFunctionName: entry.logicFunctionName,
  level: entry.level,
  errorCode: entry.errorCode ?? '',
  durationMs: 0,
  occurrenceCount: 1,
});
