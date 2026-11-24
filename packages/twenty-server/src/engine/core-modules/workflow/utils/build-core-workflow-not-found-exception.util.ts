import { msg } from '@lingui/core/macro';

import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

export const buildCoreWorkflowNotFoundException = (coreWorkflowId: string) =>
  new WorkflowQueryValidationException(
    `Core workflow '${coreWorkflowId}' not found`,
    WorkflowQueryValidationExceptionCode.FORBIDDEN,
    {
      userFriendlyMessage: msg`Workflow not found`,
    },
  );
