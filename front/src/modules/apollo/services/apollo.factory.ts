/* eslint-disable no-loop-func */
import {
  ApolloClient,
  ApolloClientOptions,
  ApolloLink,
  ServerError,
  ServerParseError,
} from '@apollo/client';
import { GraphQLErrors } from '@apollo/client/errors';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { createUploadLink } from 'apollo-upload-client';

import { renewToken } from '@/auth/services/AuthService';
import { AuthTokenPair } from '~/generated/graphql';
import { assertNotNull } from '~/utils/assert';

import { ApolloManager } from '../types/apolloManager.interface';
import { loggerLink } from '../utils';

const logger = loggerLink(() => 'Twenty');

let isRefreshing = false;

export interface Options<TCacheShape> extends ApolloClientOptions<TCacheShape> {
  onError?: (err: GraphQLErrors | undefined) => void;
  onNetworkError?: (err: Error | ServerParseError | ServerError) => void;
  onTokenPairChange?: (tokenPair: AuthTokenPair) => void;
  onUnauthenticatedError?: () => void;
  initialTokenPair: AuthTokenPair | null;
  extraLinks?: ApolloLink[];
  isDebugMode?: boolean;
}

export class ApolloFactory<TCacheShape> implements ApolloManager<TCacheShape> {
  private client: ApolloClient<TCacheShape>;
  private tokenPair: AuthTokenPair | null = null;

  constructor(opts: Options<TCacheShape>) {
    const {
      uri,
      onError: onErrorCb,
      onNetworkError,
      onTokenPairChange,
      onUnauthenticatedError,
      initialTokenPair,
      extraLinks,
      isDebugMode,
      ...options
    } = opts;

    this.tokenPair = initialTokenPair;

    const buildApolloLink = (): ApolloLink => {
      const httpLink = createUploadLink({
        uri,
      });

      const authLink = setContext(async (_, { headers }) => {
        return {
          headers: {
            ...headers,
            authorization: this.tokenPair?.accessToken.token
              ? `Bearer ${this.tokenPair?.accessToken.token}`
              : '',
          },
        };
      });

      const retryLink = new RetryLink({
        delay: {
          initial: 100,
        },
        attempts: {
          max: 2,
          retryIf: (error) => !!error,
        },
      });

      const errorLink = onError(
        ({ graphQLErrors, networkError, forward, operation }) => {
          if (graphQLErrors) {
            onErrorCb?.(graphQLErrors);

            for (const graphQLError of graphQLErrors) {
              switch (graphQLError?.extensions?.code) {
                case 'UNAUTHENTICATED': {
                  if (!isRefreshing) {
                    isRefreshing = true;
                    renewToken(uri, this.tokenPair)
                      .then((tokens) => {
                        onTokenPairChange?.(tokens);
                        return true;
                      })
                      .catch(() => {
                        onUnauthenticatedError?.();
                        return false;
                      })
                      .finally(() => {
                        isRefreshing = false;
                      });
                  }
                  return forward(operation);
                }
                default:
                  if (isDebugMode) {
                    console.warn(
                      `[GraphQL error]: Message: ${
                        graphQLError.message
                      }, Location: ${
                        graphQLError.locations
                          ? JSON.stringify(graphQLError.locations)
                          : graphQLError.locations
                      }, Path: ${graphQLError.path}`,
                    );
                  }
              }
            }
          }

          if (networkError) {
            if (isDebugMode) {
              console.warn(`[Network error]: ${networkError}`);
            }
            onNetworkError?.(networkError);
          }
        },
      );

      return ApolloLink.from(
        [
          errorLink,
          authLink,
          ...(extraLinks ? extraLinks : []),
          isDebugMode ? logger : null,
          retryLink,
          httpLink,
        ].filter(assertNotNull),
      );
    };

    this.client = new ApolloClient({
      ...options,
      link: buildApolloLink(),
    });
  }

  updateTokenPair(tokenPair: AuthTokenPair | null) {
    this.tokenPair = tokenPair;
  }

  getClient() {
    return this.client;
  }
}
