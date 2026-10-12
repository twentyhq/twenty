import { isDefined } from 'twenty-shared/utils';

// the creator, or anyone when nobody made it; the visibility read rules in this directory must agree about ownerless workflows
export const canChangeCoreWorkflowVisibility = ({
  createdByUserWorkspaceId,
  userWorkspaceId,
}: {
  createdByUserWorkspaceId: string | null;
  userWorkspaceId: string | undefined;
}): boolean =>
  !isDefined(createdByUserWorkspaceId) ||
  (isDefined(userWorkspaceId) && createdByUserWorkspaceId === userWorkspaceId);
