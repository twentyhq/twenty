import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  UriFunction,
} from '@apollo/client';
import jwt from 'jwt-decode';

import { cookieStorage } from '@/utils/cookie-storage';
import {
  RenewTokenDocument,
  RenewTokenMutation,
  RenewTokenMutationVariables,
} from '~/generated/graphql';
import { loggerLink } from '~/providers/apollo/logger';

import { tokenService } from './TokenService';

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
export const renewToken = async (uri: string | UriFunction | undefined) => {
  try {
    const tokenPair = tokenService.getTokenPair();

    if (!tokenPair) {
      throw new Error('Refresh token is not defined');
    }

    const data = await renewTokenMutation(uri, tokenPair.refreshToken);

    tokenService.setTokenPair(data.renewToken.tokens);

    return data.renewToken;
  } catch (error) {
    tokenService.removeTokenPair();
    throw error;
  }
};

export const getUserIdFromToken: () => string | null = () => {
  const accessToken = cookieStorage.getItem('accessToken');
  if (!accessToken) {
    return null;
  }

  try {
    return jwt<{ sub: string }>(accessToken).sub;
  } catch (error) {
    return null;
  }
};
