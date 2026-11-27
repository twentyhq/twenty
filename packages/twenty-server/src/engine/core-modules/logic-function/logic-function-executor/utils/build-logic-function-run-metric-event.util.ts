import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ApplicationMetricEvent } from 'src/engine/core-modules/event-logs/producers/application-metric-event/application-metric-event.type';
import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const getRunLevel = ({
  status,
  isRetryScheduled,
}: {
  status: LogicFunctionExecutionStatus;
  isRetryScheduled: boolean;
}): string => {
  if (status !== LogicFunctionExecutionStatus.ERROR) {
    return 'INFO';
  }

  return isRetryScheduled ? 'WARN' : 'ERROR';
};

export const buildLogicFunctionRunMetricEvent = ({
  result,
  isRetryScheduled,
  flatApplication,
  flatLogicFunction,
  workspaceId,
}: {
  result: LogicFunctionExecuteResult;
  isRetryScheduled: boolean;
  flatApplication: Pick<
    FlatApplication,
    'id' | 'applicationRegistrationId' | 'version'
  >;
  flatLogicFunction: Pick<FlatLogicFunction, 'id' | 'name'>;
  workspaceId: string;
}): ApplicationMetricEvent => ({
  timestamp: new Date(),
  applicationRegistrationId: flatApplication.applicationRegistrationId ?? '',
  workspaceId,
  applicationId: flatApplication.id,
  applicationVersion: flatApplication.version ?? '',
  source: 'LOGIC_FUNCTION',
  logicFunctionId: flatLogicFunction.id,
  logicFunctionName: flatLogicFunction.name,
  level: getRunLevel({ status: result.status, isRetryScheduled }),
  errorCode: result.error?.errorType ?? '',
  durationMs: result.duration,
  occurrenceCount: 1,
});
