import { isDefined } from 'twenty-shared/utils';

// Whether the reader may hand this workflow to the workspace or keep it to
// themselves: they made it, or nobody did. The read rule in this directory has
// to agree with this about an ownerless workflow.
export const canChangeCoreWorkflowVisibility = ({
  createdByUserWorkspaceId,
  userWorkspaceId,
}: {
  createdByUserWorkspaceId: string | null;
  userWorkspaceId: string | undefined;
}): boolean =>
  createdByUserWorkspaceId === null ||
  (isDefined(userWorkspaceId) && createdByUserWorkspaceId === userWorkspaceId);
