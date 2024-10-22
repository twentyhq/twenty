import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  UriFunction,
} from '@apollo/client';

import { loggerLink } from '@/apollo/utils/loggerLink';
import {
  AuthTokenPair,
  RenewTokenDocument,
  RenewTokenMutation,
  RenewTokenMutationVariables,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const logger = loggerLink(() => 'Twenty-Refresh');

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
      appToken: refreshToken,
    },
    fetchPolicy: 'network-only',
  });

  if (isDefined(errors) || isUndefinedOrNull(data)) {
    throw new Error('Something went wrong during token renewal');
  }

  return data;
};

export const renewToken = async (
  uri: string | UriFunction | undefined,
  tokenPair: AuthTokenPair | undefined | null,
) => {
  if (!tokenPair) {
    throw new Error('Refresh token is not defined');
  }

  const data = await renewTokenMutation(uri, tokenPair.refreshToken.token);

  return data?.renewToken.tokens;
};
