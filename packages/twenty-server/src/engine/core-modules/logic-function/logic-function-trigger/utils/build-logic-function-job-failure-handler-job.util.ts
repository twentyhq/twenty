import { type LogicFunctionJobFailure } from 'twenty-shared/logic-function';

import { extractJobIdFromQueueJobId } from 'src/engine/core-modules/application/application-job/utils/extract-job-id-from-queue-job-id.util';
import { type LogicFunctionJobPayload } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import { type LogicFunctionJobFailureHandlerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/types/logic-function-job-failure-handler-job.type';

export const buildLogicFunctionJobFailureHandlerJob = ({
  failedLogicFunctionPayload,
  jobFailureHandlerName,
  applicationUniversalIdentifier,
  queueJobId,
  attemptsMade,
  error,
}: {
  failedLogicFunctionPayload: Pick<
    LogicFunctionJobPayload,
    'logicFunctionId' | 'payload' | 'workspaceId' | 'userId' | 'userWorkspaceId'
  >;
  jobFailureHandlerName: string;
  applicationUniversalIdentifier: string;
  queueJobId: string;
  attemptsMade: number;
  error: LogicFunctionJobFailure['error'];
}): LogicFunctionJobFailureHandlerJob => {
  const { workspaceId } = failedLogicFunctionPayload;

  const jobFailure: LogicFunctionJobFailure = {
    payload: failedLogicFunctionPayload.payload ?? {},
    error,
    job: {
      id: extractJobIdFromQueueJobId({ workspaceId, queueJobId }),
      attemptsMade,
    },
  };

  return {
    data: {
      logicFunctionId: failedLogicFunctionPayload.logicFunctionId,
      workspaceId,
      payload: jobFailure,
      userId: failedLogicFunctionPayload.userId,
      userWorkspaceId: failedLogicFunctionPayload.userWorkspaceId,
      jobFailureHandlerName,
    },
    jobId: `${queueJobId}.on-failure`,
    workspaceId,
    applicationUniversalIdentifier,
  };
};
