import { ApolloClient } from '@apollo/client';

import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { AuthTokenPair } from '~/generated/graphql';

export interface ApolloManager<TCacheShape> {
  getClient(): ApolloClient<TCacheShape>;
  updateTokenPair(tokenPair: AuthTokenPair | null): void;
  updateWorkspaceMember(workspaceMember: CurrentWorkspaceMember | null): void;
}
