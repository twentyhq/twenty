import { type ApolloClient } from '@apollo/client';

import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';

export interface ApolloManager {
  getClient(): ApolloClient;
  updateWorkspaceMember(workspaceMember: CurrentWorkspaceMember | null): void;
}
