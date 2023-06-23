import { ApolloClient } from '@apollo/client';

import { AuthTokenPair } from '~/generated/graphql';

export interface ApolloManager<TCacheShape> {
  getClient(): ApolloClient<TCacheShape>;
  updateTokenPair(tokenPair: AuthTokenPair | null): void;
}
