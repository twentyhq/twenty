import { type LogicFunctionJobPayload } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';

export type LogicFunctionFailureHandlerJob = {
  jobData: LogicFunctionJobPayload;
  applicationUniversalIdentifier: string;
};
