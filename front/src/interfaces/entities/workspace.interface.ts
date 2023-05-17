export interface Workspace {
  id: string;
  domainName?: string;
  displayName?: string;
  logo?: string | null;
}

export type GraphqlQueryWorkspace = {
  id: string;
  display_name?: string;
  domain_name?: string;
  logo?: string | null;
  __typename: string;
};

export type GraphqlMutationWorkspace = {
  id: string;
  display_name?: string;
  domain_name?: string;
  logo?: string | null;
  __typename: string;
};

export const mapToWorkspace = (
  workspace: GraphqlQueryWorkspace,
): Workspace => ({
  id: workspace.id,
  domainName: workspace.domain_name,
  displayName: workspace.display_name,
  logo: workspace.logo,
});

export const mapToGqlWorkspace = (
  workspace: Workspace,
): GraphqlMutationWorkspace => ({
  id: workspace.id,
  domain_name: workspace.domainName,
  display_name: workspace.displayName,
  logo: workspace.logo,
  __typename: 'workspaces',
});
