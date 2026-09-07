import { getJoinableWorkspacesFromApprovedAccessDomains } from 'src/engine/core-modules/approved-access-domain/utils/get-joinable-workspaces-from-approved-access-domains.util';
import { WorkspaceDiscoverability } from 'src/engine/core-modules/workspace/types/workspace-discoverability.type';

describe('getJoinableWorkspacesFromApprovedAccessDomains', () => {
  const publicWorkspace = {
    id: 'workspace-1',
    workspaceDiscoverability: WorkspaceDiscoverability.PUBLIC,
  };

  it('should return public workspaces the user is not already a member of', () => {
    expect(
      getJoinableWorkspacesFromApprovedAccessDomains({
        approvedAccessDomains: [{ workspace: publicWorkspace }],
        alreadyMemberWorkspaceIds: [],
      }),
    ).toEqual([{ workspace: publicWorkspace }]);
  });

  it('should skip approved-domain rows whose workspace did not load (orphaned/soft-deleted)', () => {
    expect(
      getJoinableWorkspacesFromApprovedAccessDomains({
        approvedAccessDomains: [
          { workspace: null },
          { workspace: publicWorkspace },
        ],
        alreadyMemberWorkspaceIds: [],
      }),
    ).toEqual([{ workspace: publicWorkspace }]);
  });

  it('should skip non-public workspaces', () => {
    expect(
      getJoinableWorkspacesFromApprovedAccessDomains({
        approvedAccessDomains: [
          {
            workspace: {
              id: 'workspace-2',
              workspaceDiscoverability: WorkspaceDiscoverability.HIDDEN,
            },
          },
        ],
        alreadyMemberWorkspaceIds: [],
      }),
    ).toEqual([]);
  });

  it('should skip workspaces the user is already a member of', () => {
    expect(
      getJoinableWorkspacesFromApprovedAccessDomains({
        approvedAccessDomains: [{ workspace: publicWorkspace }],
        alreadyMemberWorkspaceIds: ['workspace-1'],
      }),
    ).toEqual([]);
  });
});
