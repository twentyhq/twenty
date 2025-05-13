import { Catch, ExceptionFilter } from '@nestjs/common';

import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { CustomException } from 'src/utils/custom-exception';

@Catch(WorkflowTriggerException)
export class WorkflowTriggerGraphqlApiExceptionFilter
  implements ExceptionFilter
{
  catch(exception: WorkflowTriggerException) {
    switch (exception.code) {
      case WorkflowTriggerExceptionCode.INVALID_INPUT:
      case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION:
      case WorkflowTriggerExceptionCode.INVALID_ACTION_TYPE:
      case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER:
      case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_STATUS:
      case WorkflowTriggerExceptionCode.FORBIDDEN:
        throw new UserInputError(exception.message);
      case WorkflowTriggerExceptionCode.NOT_FOUND:
        throw new NotFoundError(exception.message);
      default:
        throw new CustomException(exception.message, exception.code);
    }
  }
}
