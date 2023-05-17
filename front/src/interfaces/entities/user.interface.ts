import {
  GraphqlQueryWorkspaceMember,
  WorkspaceMember,
  mapToWorkspaceMember,
} from './workspace_member.interface';

export interface User {
  __typename: 'users';
  id: string;
  email?: string;
  displayName?: string;
  workspaceMember?: WorkspaceMember;
}

export type GraphqlQueryUser = {
  id: string;
  email?: string;
  displayName?: string;
  workspace_member?: GraphqlQueryWorkspaceMember;
  __typename: string;
};

export type GraphqlMutationUser = {
  id: string;
  email?: string;
  displayName?: string;
  workspace_member_id?: string;
  __typename: string;
};

export const mapToUser = (user: GraphqlQueryUser): User => ({
  __typename: 'users',
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  workspaceMember: user.workspace_member
    ? mapToWorkspaceMember(user.workspace_member)
    : user.workspace_member,
});

export const mapToGqlUser = (user: User): GraphqlMutationUser => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  workspace_member_id: user.workspaceMember?.id,
  __typename: 'users',
});
