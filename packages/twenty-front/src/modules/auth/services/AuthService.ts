import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';

import { loggerLink } from '@/apollo/utils/loggerLink';
import { isDefined } from 'twenty-shared/utils';
import {
  type AuthTokenPair,
  RenewTokenDocument,
  type RenewTokenMutation,
  type RenewTokenMutationVariables,
} from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const logger = loggerLink(() => 'Twenty-Refresh');

const renewTokenMutation = async (
  uri: string | undefined,
  refreshToken: string,
) => {
  const httpLink = new HttpLink({ uri });

  // Create new client to call refresh token graphql mutation
  const client = new ApolloClient({
    link: ApolloLink.from([logger, httpLink]),
    cache: new InMemoryCache({}),
  });

  const { data, error } = await client.mutate<
    RenewTokenMutation,
    RenewTokenMutationVariables
  >({
    mutation: RenewTokenDocument,
    variables: {
      appToken: refreshToken,
    },
    fetchPolicy: 'network-only',
  });

  if (isDefined(error) || isUndefinedOrNull(data)) {
    throw new Error('Something went wrong during token renewal');
  }

  return data;
};

export const renewToken = async (
  uri: string | undefined,
  tokenPair: AuthTokenPair | undefined | null,
) => {
  if (!tokenPair) {
    throw new Error('Refresh token is not defined');
  }

  const data = await renewTokenMutation(uri, tokenPair.refreshToken.token);

  return data?.renewToken.tokens;
};
