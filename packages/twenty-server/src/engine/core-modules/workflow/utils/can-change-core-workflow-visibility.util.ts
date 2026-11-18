import { isDefined } from 'twenty-shared/utils';

export const canChangeCoreWorkflowVisibility = ({
  createdByUserWorkspaceId,
  userWorkspaceId,
}: {
  createdByUserWorkspaceId: string | null;
  userWorkspaceId: string | undefined;
}): boolean =>
  !isDefined(createdByUserWorkspaceId) ||
  (isDefined(userWorkspaceId) && createdByUserWorkspaceId === userWorkspaceId);
