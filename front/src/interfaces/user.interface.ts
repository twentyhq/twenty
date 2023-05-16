import {
  GraphqlQueryWorkspaceMember,
  WorkspaceMember,
  mapToGqlWorkspaceMember,
} from './workspace_member.interface';
import { mapToWorkspaceMember } from './workspace_member.interface';

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  workspaceMember?: WorkspaceMember;
}

export type GraphqlQueryUser = {
  id: string;
  email?: string;
  display_name?: string;
  workspace_member?: GraphqlQueryWorkspaceMember;
  __typename: string;
};

export type GraphqlMutationUser = {
  id: string;
  email?: string;
  display_name?: string;
  workspace_member_id?: string;
  __typename: string;
};

export const mapToUser = (user: GraphqlQueryUser): User => ({
  id: user.id,
  email: user.email,
  displayName: user.display_name,
  workspaceMember: user.workspace_member
    ? mapToWorkspaceMember(user.workspace_member)
    : user.workspace_member,
});

export const mapToGqlUser = (user: User): GraphqlMutationUser => ({
  id: user.id,
  email: user.email,
  display_name: user.displayName,
  workspace_member_id: user.workspaceMember?.id,
  __typename: 'user',
});
