import { WorkspaceDiscoverability } from 'src/engine/core-modules/workspace/types/workspace-discoverability.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type AvailableWorkspace = {
  workspace: Pick<WorkspaceEntity, 'workspaceDiscoverability'>;
};

const isNotHidden = ({ workspace }: AvailableWorkspace) =>
  workspace.workspaceDiscoverability !== WorkspaceDiscoverability.HIDDEN;

export const filterOutHiddenAvailableWorkspaces = <
  TSignIn extends AvailableWorkspace,
  TSignUp extends AvailableWorkspace,
>({
  availableWorkspacesForSignIn,
  availableWorkspacesForSignUp,
}: {
  availableWorkspacesForSignIn: TSignIn[];
  availableWorkspacesForSignUp: TSignUp[];
}) => ({
  availableWorkspacesForSignIn:
    availableWorkspacesForSignIn.filter(isNotHidden),
  availableWorkspacesForSignUp:
    availableWorkspacesForSignUp.filter(isNotHidden),
});
