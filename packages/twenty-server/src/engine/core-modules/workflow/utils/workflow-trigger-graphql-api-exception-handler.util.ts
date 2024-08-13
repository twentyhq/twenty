import {
  InternalServerError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/workflow-trigger.exception';

export const workflowTriggerGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof WorkflowTriggerException) {
    switch (error.code) {
      case WorkflowTriggerExceptionCode.INVALID_INPUT:
        throw new UserInputError(error.message);
      case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER:
      case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION:
      case WorkflowTriggerExceptionCode.INVALID_ACTION_TYPE:
      default:
        throw new InternalServerError(error.message);
    }
  }

  throw error;
};
