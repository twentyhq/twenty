import {
  GraphqlQueryWorkspaceMember,
  mapToWorkspaceMember,
  WorkspaceMember,
} from './workspaceMember.interface';

export interface User {
  __typename: 'users';
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  workspaceMember?: WorkspaceMember | null;
}

export type GraphqlQueryUser = {
  id: string;
  email?: string;
  displayName?: string;
  workspaceMember?: GraphqlQueryWorkspaceMember | null;
  avatarUrl?: string;
  __typename?: string;
};

export type GraphqlMutationUser = {
  id: string;
  email?: string;
  displayName?: string;
  workspaceMemberId?: string;
  __typename?: string;
};

export const mapToUser = (user: GraphqlQueryUser): User => ({
  __typename: 'users',
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
  workspaceMember: user.workspaceMember
    ? mapToWorkspaceMember(user.workspaceMember)
    : user.workspaceMember,
});

export const mapToGqlUser = (user: User): GraphqlMutationUser => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  workspaceMemberId: user.workspaceMember?.id,
  __typename: 'users',
});
