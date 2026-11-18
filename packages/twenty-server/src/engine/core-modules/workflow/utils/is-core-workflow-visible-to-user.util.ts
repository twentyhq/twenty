import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isCoreWorkflowVisibleToUser = ({
  visibility,
  createdByUserWorkspaceId,
  userWorkspaceId,
}: {
  visibility: WorkflowVisibility;
  createdByUserWorkspaceId: string | null;
  userWorkspaceId: string | undefined;
}): boolean =>
  visibility === WorkflowVisibility.WORKSPACE ||
  (isDefined(userWorkspaceId) && createdByUserWorkspaceId === userWorkspaceId);
