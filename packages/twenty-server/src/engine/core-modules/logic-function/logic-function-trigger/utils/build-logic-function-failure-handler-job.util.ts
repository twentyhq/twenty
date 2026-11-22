import { type LogicFunctionFailureHandlerPayload } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';

import { type LogicFunctionJobPayload } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import { type LogicFunctionFailureHandlerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/types/logic-function-failure-handler-job.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const buildLogicFunctionFailureHandlerJob = ({
  failedLogicFunctionPayload,
  failedFlatLogicFunction,
  failureHandler,
  error,
}: {
  failedLogicFunctionPayload: LogicFunctionJobPayload;
  failedFlatLogicFunction: Pick<
    FlatLogicFunction,
    'universalIdentifier' | 'applicationId' | 'applicationUniversalIdentifier'
  >;
  failureHandler:
    | Pick<FlatLogicFunction, 'id' | 'applicationId' | 'deletedAt'>
    | undefined;
  error: LogicFunctionFailureHandlerPayload['error'];
}): LogicFunctionFailureHandlerJob | undefined => {
  if (
    !isDefined(failureHandler) ||
    isDefined(failureHandler.deletedAt) ||
    failureHandler.applicationId !== failedFlatLogicFunction.applicationId
  ) {
    return undefined;
  }

  const failureHandlerPayload: LogicFunctionFailureHandlerPayload = {
    failedLogicFunctionUniversalIdentifier:
      failedFlatLogicFunction.universalIdentifier,
    payload: failedLogicFunctionPayload.payload ?? {},
    error,
  };

  return {
    jobData: {
      logicFunctionId: failureHandler.id,
      workspaceId: failedLogicFunctionPayload.workspaceId,
      payload: failureHandlerPayload,
      userId: failedLogicFunctionPayload.userId,
      userWorkspaceId: failedLogicFunctionPayload.userWorkspaceId,
      isFailureHandlerRun: true,
    },
    applicationUniversalIdentifier:
      failedFlatLogicFunction.applicationUniversalIdentifier,
  };
};
