import { isDefined } from 'twenty-shared/utils';

// the creator, or anyone when nobody made it: an ownerless workflow is claimable while it is shared, and hidden once private
export const canChangeCoreWorkflowVisibility = ({
  createdByUserWorkspaceId,
  userWorkspaceId,
}: {
  createdByUserWorkspaceId: string | null;
  userWorkspaceId: string | undefined;
}): boolean =>
  !isDefined(createdByUserWorkspaceId) ||
  (isDefined(userWorkspaceId) && createdByUserWorkspaceId === userWorkspaceId);
