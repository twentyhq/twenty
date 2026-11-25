import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';

export const handleWorkflowRunException = (exception: WorkflowRunException) => {
  switch (exception.code) {
    case WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND:
    case WorkflowRunExceptionCode.WORKFLOW_ROOT_STEP_NOT_FOUND:
      throw new NotFoundError(exception);
    case WorkflowRunExceptionCode.INVALID_OPERATION:
    case WorkflowRunExceptionCode.INVALID_INPUT:
    case WorkflowRunExceptionCode.WORKFLOW_RUN_LIMIT_REACHED:
    case WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID:
      throw new UserInputError(exception);
    default: {
      assertUnreachable(exception.code);
    }
  }
};

@Catch(WorkflowRunException)
export class WorkflowRunGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: WorkflowRunException) {
    handleWorkflowRunException(exception);
  }
}
