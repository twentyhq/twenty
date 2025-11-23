import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';

export const handleWorkflowVersionStepException = (
  exception: WorkflowVersionStepException,
) => {
  switch (exception.code) {
    case WorkflowVersionStepExceptionCode.INVALID_REQUEST:
      throw new UserInputError(exception);
    case WorkflowVersionStepExceptionCode.NOT_FOUND:
      throw new NotFoundError(exception);
    case WorkflowVersionStepExceptionCode.CODE_STEP_FAILURE:
    case WorkflowVersionStepExceptionCode.AI_AGENT_STEP_FAILURE:
      throw new InternalServerError(exception);
    default: {
      assertUnreachable(exception.code);
    }
  }
};

@Catch(WorkflowVersionStepException)
export class WorkflowVersionStepGraphqlApiExceptionFilter
  implements ExceptionFilter
{
  catch(exception: WorkflowVersionStepException) {
    handleWorkflowVersionStepException(exception);
  }
}
