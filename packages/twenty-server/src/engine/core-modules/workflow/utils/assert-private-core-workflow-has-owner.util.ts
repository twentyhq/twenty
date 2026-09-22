import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

// PRIVATE scopes a workflow to the user workspace that created it. An application
// or an API key authenticates a workspace rather than a person, so it has no user
// workspace to be that owner and the row would be written with a null
// `createdByUserWorkspaceId`. Two existing behaviours then work against the
// request: `buildCoreWorkflowVisibilityWhere` reads a null owner as readable by
// the whole workspace — the clause that keeps a workflow reachable once its
// creator leaves — and `updateWorkflowVisibility` lets the first member to set a
// visibility claim an unowned workflow. A PRIVATE workflow created by an
// application would therefore be readable and claimable by every member, the
// opposite of what was asked for, so refuse it rather than store a row that
// cannot mean what it says.
export const assertPrivateCoreWorkflowHasOwner = ({
  visibility,
  userWorkspaceId,
}: {
  userWorkspaceId: string | undefined;
  visibility: WorkflowVisibility | undefined;
}): void => {
  if (visibility !== WorkflowVisibility.PRIVATE || isDefined(userWorkspaceId)) {
    return;
  }

  throw new WorkflowQueryValidationException(
    'A private core workflow must be owned by the user workspace that creates it, and an application has none',
    WorkflowQueryValidationExceptionCode.FORBIDDEN,
  );
};
