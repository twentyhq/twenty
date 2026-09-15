import { isDefined } from 'twenty-shared/utils';

import { WorkspaceDiscoverability } from 'src/engine/core-modules/workspace/types/workspace-discoverability.type';

export const getJoinableWorkspacesFromApprovedAccessDomains = <
  TWorkspace extends {
    id: string;
    workspaceDiscoverability: WorkspaceDiscoverability;
  },
>({
  approvedAccessDomains,
  alreadyMemberWorkspaceIds,
}: {
  approvedAccessDomains: { workspace: TWorkspace | null }[];
  alreadyMemberWorkspaceIds: string[];
}): { workspace: TWorkspace }[] => {
  return approvedAccessDomains
    .map((approvedAccessDomain) => approvedAccessDomain.workspace)
    .filter(isDefined)
    .filter(
      (workspace) =>
        workspace.workspaceDiscoverability ===
          WorkspaceDiscoverability.PUBLIC &&
        !alreadyMemberWorkspaceIds.includes(workspace.id),
    )
    .map((workspace) => ({ workspace }));
};
