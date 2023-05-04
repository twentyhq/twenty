import {
  GraphqlQueryWorkspaceMember,
  WorkspaceMember,
} from './workspace.interface';

export type GraphqlQueryUser = {
  id: string;
  email: string;
  displayName: string;
  workspace_member?: GraphqlQueryWorkspaceMember;
  __typename: string;
};

export interface User {
  id: string;
  email: string;
  displayName: string;
  workspace_member?: WorkspaceMember;
}

export const mapUser = (user: GraphqlQueryUser): User => {
  const mappedUser = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  } as User;
  if (user.workspace_member) {
    mappedUser['workspace_member'] = {
      workspace: {
        id: user.workspace_member.workspace.id,
        displayName: user.workspace_member.workspace.display_name,
        domainName: user.workspace_member.workspace.domain_name,
        logo: user.workspace_member.workspace.logo,
      },
    };
  }

  return mappedUser;
};
