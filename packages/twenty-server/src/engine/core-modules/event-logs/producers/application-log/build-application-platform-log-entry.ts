import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';

export const buildApplicationPlatformLogEntry = ({
  logicFunctionId = '',
  logicFunctionName = '',
  ...entry
}: Omit<
  ApplicationLogEntry,
  'timestamp' | 'logicFunctionId' | 'logicFunctionName' | 'executionId'
> &
  Partial<
    Pick<ApplicationLogEntry, 'logicFunctionId' | 'logicFunctionName'>
  >): ApplicationLogEntry => ({
  ...entry,
  timestamp: new Date(),
  logicFunctionId,
  logicFunctionName,
  executionId: '',
});
