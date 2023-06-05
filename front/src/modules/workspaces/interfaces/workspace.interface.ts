export interface Workspace {
  id: string;
  domainName?: string;
  displayName?: string;
  logo?: string | null;
}

export type GraphqlQueryWorkspace = {
  id: string;
  displayName?: string;
  domainName?: string;
  logo?: string | null;
  __typename?: string;
};

export type GraphqlMutationWorkspace = {
  id: string;
  displayName?: string;
  domainName?: string;
  logo?: string | null;
  __typename?: string;
};

export const mapToWorkspace = (
  workspace: GraphqlQueryWorkspace,
): Workspace => ({
  id: workspace.id,
  domainName: workspace.domainName,
  displayName: workspace.displayName,
  logo: workspace.logo,
});

export const mapToGqlWorkspace = (
  workspace: Workspace,
): GraphqlMutationWorkspace => ({
  id: workspace.id,
  domainName: workspace.domainName,
  displayName: workspace.displayName,
  logo: workspace.logo,
  __typename: 'workspaces',
});
