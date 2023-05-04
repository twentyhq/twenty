import { Workspace } from './workspace.interface';

export type GraphqlQueryUser = {
  id: string;
  email: string;
  displayName: string;
};

export interface User {
  id: string;
  email: string;
  displayName: string;
  workspace_member?: {
    workspace: Workspace;
  };
}

export const mapUser = (user: GraphqlQueryUser): User => ({
  ...user,
});
