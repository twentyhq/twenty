import { ApolloClient } from '@apollo/client';

export interface ApolloManager<TCacheShape> {
  getClient(): ApolloClient<TCacheShape>;
}
