import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

export const assertPrivateCoreWorkflowHasOwner = ({
  visibility,
  userWorkspaceId,
}: {
  visibility?: WorkflowVisibility;
  userWorkspaceId?: string;
}) => {
  if (
    visibility === WorkflowVisibility.PRIVATE &&
    !isDefined(userWorkspaceId)
  ) {
    throw new WorkflowQueryValidationException(
      'A private workflow must have an owner (userWorkspaceId). An application or API key cannot own a private workflow.',
      WorkflowQueryValidationExceptionCode.FORBIDDEN,
    );
  }
};
