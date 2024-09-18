import { Catch, ExceptionFilter } from '@nestjs/common';

import {
  InternalServerError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

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
      case WorkflowTriggerExceptionCode.FORBIDDEN:
        throw new UserInputError(exception.message);
      default:
        throw new InternalServerError(exception.message);
    }
  }
}
