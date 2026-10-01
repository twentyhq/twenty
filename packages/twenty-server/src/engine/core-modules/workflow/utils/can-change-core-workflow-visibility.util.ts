import { isDefined } from 'twenty-shared/utils';

// must agree with buildCoreWorkflowVisibilityWhere about ownerless workflows
export const canChangeCoreWorkflowVisibility = ({
  createdByUserWorkspaceId,
  userWorkspaceId,
}: {
  createdByUserWorkspaceId: string | null;
  userWorkspaceId: string | undefined;
}): boolean =>
  !isDefined(createdByUserWorkspaceId) ||
  (isDefined(userWorkspaceId) && createdByUserWorkspaceId === userWorkspaceId);
