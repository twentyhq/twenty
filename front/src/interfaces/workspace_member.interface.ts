import {
  Workspace,
  GraphqlQueryWorkspace,
  mapToWorkspace,
} from './workspace.interface';

export interface WorkspaceMember {
  id: string;
  workspace: Workspace;
}

export type GraphqlQueryWorkspaceMember = {
  id: string;
  workspace: GraphqlQueryWorkspace;
  __typename: string;
};

export type GraphqlMutationWorkspaceMember = {
  id: string;
  workspace_id: string;
  __typename: string;
};

export const mapToWorkspaceMember = (
  workspaceMember: GraphqlQueryWorkspaceMember,
): WorkspaceMember => ({
  id: workspaceMember.id,
  workspace: workspaceMember.workspace
    ? mapToWorkspace(workspaceMember.workspace)
    : workspaceMember.workspace,
});

export const mapToGqlWorkspaceMember = (
  workspaceMember: WorkspaceMember,
): GraphqlMutationWorkspaceMember => ({
  id: workspaceMember.id,
  workspace_id: workspaceMember.workspace?.id,
  __typename: 'workspace_member',
});
