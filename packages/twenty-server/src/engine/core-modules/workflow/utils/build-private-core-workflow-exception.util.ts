import { msg } from '@lingui/core/macro';

import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

export const buildPrivateCoreWorkflowException = (coreWorkflowId: string) =>
  new WorkflowQueryValidationException(
    `Core workflow '${coreWorkflowId}' is private to another member`,
    WorkflowQueryValidationExceptionCode.FORBIDDEN,
    {
      // Same message as a missing workflow, so a private one does not announce that it exists.
      userFriendlyMessage: msg`Workflow not found`,
    },
  );
