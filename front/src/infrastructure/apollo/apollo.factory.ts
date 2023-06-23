/* eslint-disable no-loop-func */
import {
  ApolloClient,
  ApolloClientOptions,
  ApolloLink,
  createHttpLink,
  ServerError,
  ServerParseError,
} from '@apollo/client';
import { GraphQLErrors } from '@apollo/client/errors';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { Observable } from '@apollo/client/utilities';

import { renewToken } from '@/auth/services/AuthService';
import { tokenService } from '@/auth/services/TokenService';

import { ApolloManager } from './interfaces/apollo-manager.interface';
import { assertNotNull } from './utils/assert';
import { promiseToObservable } from './utils/promise-to-observable';
import { loggerLink } from './logger';

const logger = loggerLink(() => 'Twenty');

let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

const resolvePendingRequests = () => {
  pendingRequests.map((callback) => callback());
  pendingRequests = [];
};

export interface Options<TCacheShape> extends ApolloClientOptions<TCacheShape> {
  onError?: (err: GraphQLErrors | undefined) => void;
  onNetworkError?: (err: Error | ServerParseError | ServerError) => void;
  onUnauthenticatedError?: () => void;
}

export class ApolloFactory<TCacheShape> implements ApolloManager<TCacheShape> {
  private client: ApolloClient<TCacheShape>;

  constructor(opts: Options<TCacheShape>) {
    const {
      uri,
      onError: onErrorCb,
      onNetworkError,
      onUnauthenticatedError,
      ...options
    } = opts;

    const buildApolloLink = (): ApolloLink => {
      const httpLink = createHttpLink({
        uri,
      });

      const authLink = setContext(async (_, { headers }) => {
        const credentials = tokenService.getTokenPair();

        return {
          headers: {
            ...headers,
            authorization: credentials?.accessToken
              ? `Bearer ${credentials?.accessToken}`
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
                  // error code is set to UNAUTHENTICATED
                  // when AuthenticationError thrown in resolver
                  let forward$: Observable<boolean>;

                  if (!isRefreshing) {
                    isRefreshing = true;
                    forward$ = promiseToObservable(
                      renewToken(uri)
                        .then(() => {
                          resolvePendingRequests();
                          return true;
                        })
                        .catch(() => {
                          pendingRequests = [];
                          onUnauthenticatedError?.();
                          return false;
                        })
                        .finally(() => {
                          isRefreshing = false;
                        }),
                    ).filter((value) => Boolean(value));
                  } else {
                    // Will only emit once the Promise is resolved
                    forward$ = promiseToObservable(
                      new Promise<boolean>((resolve) => {
                        pendingRequests.push(() => resolve(true));
                      }),
                    );
                  }

                  return forward$.flatMap(() => forward(operation));
                }
                default:
                  if (process.env.NODE_ENV === 'development') {
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
            if (process.env.NODE_ENV === 'development') {
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
          // Only show logger in dev mode
          process.env.NODE_ENV !== 'production' ? logger : null,
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

  getClient() {
    return this.client;
  }
}
