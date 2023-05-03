import { GraphqlQueryAccountOwner } from './company.interface';
import { Workspace } from './workspace.interface';

export interface User {
  id: string;
  email: string;
  displayName: string;
  workspace_member?: {
    workspace: Workspace;
  };
}

export const mapUser = (user: GraphqlQueryAccountOwner): User => ({
  ...user,
});
