import { isDefined } from 'twenty-shared/utils';

export const isCoreWorkflowVisibleToUser = ({
  isPrivate,
  createdByUserWorkspaceId,
  userWorkspaceId,
}: {
  isPrivate: boolean;
  createdByUserWorkspaceId: string | null;
  userWorkspaceId: string | undefined;
}): boolean =>
  !isPrivate ||
  (isDefined(userWorkspaceId) && createdByUserWorkspaceId === userWorkspaceId);
