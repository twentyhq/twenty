import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';

export const buildApplicationPlatformLogEntry = (
  entry: Omit<
    ApplicationLogEntry,
    'timestamp' | 'logicFunctionId' | 'logicFunctionName' | 'executionId'
  >,
): ApplicationLogEntry => ({
  ...entry,
  timestamp: new Date(),
  logicFunctionId: '',
  logicFunctionName: '',
  executionId: '',
});
