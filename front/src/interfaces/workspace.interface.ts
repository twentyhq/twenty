export interface Workspace {
  id: string;
  domainName: string;
  displayName: string;
  logo: string;
}

export interface WorkspaceMember {
  workspace: Workspace;
}

export type GraphqlQueryWorkspace = {
  id: string;
  display_name: string;
  domain_name: string;
  logo: string;
  __typename: string;
};
export type GraphqlQueryWorkspaceMember = {
  workspace: GraphqlQueryWorkspace;
  __typename: string;
};
