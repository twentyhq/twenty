import { type ApolloClient } from '@apollo/client';

import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';

export interface ApolloManager<TCacheShape> {
  getClient(): ApolloClient<TCacheShape>;
  updateWorkspaceMember(workspaceMember: CurrentWorkspaceMember | null): void;
}
