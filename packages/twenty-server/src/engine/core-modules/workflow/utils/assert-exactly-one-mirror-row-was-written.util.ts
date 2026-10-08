import { msg } from '@lingui/core/macro';

import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

export const assertExactlyOneMirrorRowWasWritten = ({
  affected,
  coreWorkflowVersionId,
}: {
  affected: number | null | undefined;
  coreWorkflowVersionId: string;
}): void => {
  if (affected === 1) {
    return;
  }

  throw new WorkflowQueryValidationException(
    `Core workflow version '${coreWorkflowVersionId}' wrote ${affected ?? 0} workspace mirror rows instead of exactly one`,
    WorkflowQueryValidationExceptionCode.FORBIDDEN,
    {
      userFriendlyMessage: msg`Workflow version is not correctly linked to its mirror`,
    },
  );
};
