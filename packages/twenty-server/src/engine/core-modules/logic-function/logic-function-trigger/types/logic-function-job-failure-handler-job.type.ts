import { type LogicFunctionJobPayload } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import { type ApplicationQueueJobScope } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export type LogicFunctionJobFailureHandlerJob = ApplicationQueueJobScope & {
  data: LogicFunctionJobPayload;
  jobId: string;
};
