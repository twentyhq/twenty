import { isNonEmptyString } from '@sniptt/guards';

import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { type ParsedLogLine } from 'src/engine/core-modules/event-logs/producers/application-log/parsed-log-line.type';
import { type LogicFunctionExecuteError } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

const getStackTraceLines = (
  stackTrace?: LogicFunctionExecuteError['stackTrace'],
): string[] => {
  if (Array.isArray(stackTrace)) {
    return stackTrace;
  }

  return isNonEmptyString(stackTrace) ? stackTrace.split('\n') : [];
};

export const buildLogicFunctionErrorLogLine = (
  error: Pick<LogicFunctionExecuteError, 'errorType' | 'errorMessage'> &
    Partial<Pick<LogicFunctionExecuteError, 'stackTrace'>>,
): ParsedLogLine & Pick<ApplicationLogEntry, 'errorCode' | 'properties'> => ({
  timestamp: new Date(),
  level: 'ERROR',
  message: `${error.errorType}: ${error.errorMessage}`,
  errorCode: error.errorType,
  properties: {
    stackTrace: getStackTraceLines(error.stackTrace),
  },
});
