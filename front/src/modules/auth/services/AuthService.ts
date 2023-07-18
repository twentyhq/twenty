import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  UriFunction,
} from '@apollo/client';

import { loggerLink } from '@/utils/apollo-logger';
import {
  AuthTokenPair,
  RenewTokenDocument,
  RenewTokenMutation,
  RenewTokenMutationVariables,
} from '~/generated/graphql';

const logger = loggerLink(() => 'Twenty-Refresh');

/**
 * Renew token mutation with custom apollo client
 * @param uri string | UriFunction | undefined
 * @param refreshToken string
 * @returns RenewTokenMutation
 */
const renewTokenMutation = async (
  uri: string | UriFunction | undefined,
  refreshToken: string,
) => {
  const httpLink = new HttpLink({ uri });

  // Create new client to call refresh token graphql mutation
  const client = new ApolloClient({
    link: ApolloLink.from([logger, httpLink]),
    cache: new InMemoryCache({}),
  });

  const { data, errors } = await client.mutate<
    RenewTokenMutation,
    RenewTokenMutationVariables
  >({
    mutation: RenewTokenDocument,
    variables: {
      refreshToken: refreshToken,
    },
    fetchPolicy: 'network-only',
  });

  if (errors || !data) {
    throw new Error('Something went wrong during token renewal');
  }

  return data;
};

/**
 * Renew token and update cookie storage
 * @param uri string | UriFunction | undefined
 * @returns TokenPair
 */
export const renewToken = async (
  uri: string | UriFunction | undefined,
  tokenPair: AuthTokenPair | undefined | null,
) => {
  if (!tokenPair) {
    throw new Error('Refresh token is not defined');
  }

  const data = await renewTokenMutation(uri, tokenPair.refreshToken.token);

  return data.renewToken.tokens;
};
