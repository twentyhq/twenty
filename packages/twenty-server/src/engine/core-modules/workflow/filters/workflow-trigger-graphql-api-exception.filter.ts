import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

export const handleWorkflowTriggerException = (
  exception: WorkflowTriggerException,
) => {
  switch (exception.code) {
    case WorkflowTriggerExceptionCode.INVALID_INPUT:
    case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION:
    case WorkflowTriggerExceptionCode.INVALID_ACTION_TYPE:
    case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER:
    case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_STATUS:
    case WorkflowTriggerExceptionCode.FORBIDDEN:
      throw new UserInputError(exception);
    case WorkflowTriggerExceptionCode.NOT_FOUND:
      throw new NotFoundError(exception);
    case WorkflowTriggerExceptionCode.INTERNAL_ERROR:
      throw exception;
    default: {
      assertUnreachable(exception.code);
    }
  }
};

@Catch(WorkflowTriggerException)
export class WorkflowTriggerGraphqlApiExceptionFilter
  implements ExceptionFilter
{
  catch(exception: WorkflowTriggerException) {
    handleWorkflowTriggerException(exception);
  }
}
