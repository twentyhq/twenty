import { filterOutHiddenAvailableWorkspaces } from 'src/engine/core-modules/user-workspace/utils/filter-out-hidden-available-workspaces.util';
import { WorkspaceDiscoverability } from 'src/engine/core-modules/workspace/types/workspace-discoverability.type';

const buildAvailableWorkspace = (
  id: string,
  workspaceDiscoverability: WorkspaceDiscoverability,
) => ({
  workspace: { id, workspaceDiscoverability },
});

describe('filterOutHiddenAvailableWorkspaces', () => {
  it('should remove hidden workspaces from both lists', () => {
    const result = filterOutHiddenAvailableWorkspaces({
      availableWorkspacesForSignIn: [
        buildAvailableWorkspace('public', WorkspaceDiscoverability.PUBLIC),
        buildAvailableWorkspace('hidden', WorkspaceDiscoverability.HIDDEN),
      ],
      availableWorkspacesForSignUp: [
        buildAvailableWorkspace('hidden', WorkspaceDiscoverability.HIDDEN),
      ],
    });

    expect(
      result.availableWorkspacesForSignIn.map(({ workspace }) => workspace.id),
    ).toEqual(['public']);
    expect(result.availableWorkspacesForSignUp).toEqual([]);
  });

  it('should keep workspaces discoverable by members and invitees', () => {
    const result = filterOutHiddenAvailableWorkspaces({
      availableWorkspacesForSignIn: [
        buildAvailableWorkspace(
          'membersAndInvitees',
          WorkspaceDiscoverability.MEMBERS_AND_INVITEES,
        ),
      ],
      availableWorkspacesForSignUp: [],
    });

    expect(
      result.availableWorkspacesForSignIn.map(({ workspace }) => workspace.id),
    ).toEqual(['membersAndInvitees']);
  });
});
