import {
  ApolloClient,
  ApolloClientOptions,
  ApolloLink,
  fromPromise,
  ServerError,
  ServerParseError,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { createUploadLink } from 'apollo-upload-client';

import { renewToken } from '@/auth/services/AuthService';
import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { AuthTokenPair } from '~/generated/graphql';
import { logDebug } from '~/utils/logDebug';

import { i18n } from '@lingui/core';
import { GraphQLFormattedError } from 'graphql';
import { isDefined } from 'twenty-shared/utils';
import { cookieStorage } from '~/utils/cookie-storage';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { ApolloManager } from '../types/apolloManager.interface';
import { loggerLink } from '../utils/loggerLink';
import { getTokenPair } from '../utils/getTokenPair';

const logger = loggerLink(() => 'Twenty');

export interface Options<TCacheShape> extends ApolloClientOptions<TCacheShape> {
  onError?: (err: readonly GraphQLFormattedError[] | undefined) => void;
  onNetworkError?: (err: Error | ServerParseError | ServerError) => void;
  onTokenPairChange?: (tokenPair: AuthTokenPair) => void;
  onUnauthenticatedError?: () => void;
  currentWorkspaceMember: CurrentWorkspaceMember | null;
  extraLinks?: ApolloLink[];
  isDebugMode?: boolean;
}

export class ApolloFactory<TCacheShape> implements ApolloManager<TCacheShape> {
  private client: ApolloClient<TCacheShape>;
  private currentWorkspaceMember: CurrentWorkspaceMember | null = null;

  constructor(opts: Options<TCacheShape>) {
    const {
      uri,
      onError: onErrorCb,
      onNetworkError,
      onTokenPairChange,
      onUnauthenticatedError,
      currentWorkspaceMember,
      extraLinks,
      isDebugMode,
      ...options
    } = opts;

    this.currentWorkspaceMember = currentWorkspaceMember;

    const buildApolloLink = (): ApolloLink => {
      const httpLink = createUploadLink({
        uri,
      });

      const authLink = setContext(async (_, { headers }) => {
        const tokenPair = getTokenPair();

        if (isUndefinedOrNull(tokenPair)) {
          return {
            headers: {
              ...headers,
              ...options.headers,
            },
          };
        }

        return {
          headers: {
            ...headers,
            ...options.headers,
            authorization: tokenPair.accessToken.token
              ? `Bearer ${tokenPair.accessToken.token}`
              : '',
            ...(this.currentWorkspaceMember?.locale
              ? { 'x-locale': this.currentWorkspaceMember.locale }
              : { 'x-locale': i18n.locale }),
          },
        };
      });

      const retryLink = new RetryLink({
        delay: {
          initial: 3000,
        },
        attempts: {
          max: 2,
          retryIf: (error) => !!error,
        },
      });
      const errorLink = onError(
        ({ graphQLErrors, networkError, forward, operation }) => {
          if (isDefined(graphQLErrors)) {
            onErrorCb?.(graphQLErrors);
            for (const graphQLError of graphQLErrors) {
              if (graphQLError.message === 'Unauthorized') {
                return fromPromise(
                  renewToken(uri, getTokenPair())
                    .then((tokens) => {
                      if (isDefined(tokens)) {
                        onTokenPairChange?.(tokens);
                      }
                    })
                    .catch(() => {
                      onUnauthenticatedError?.();
                    }),
                ).flatMap(() => forward(operation));
              }

              switch (graphQLError?.extensions?.code) {
                case 'UNAUTHENTICATED': {
                  return fromPromise(
                    renewToken(uri, getTokenPair())
                      .then((tokens) => {
                        if (isDefined(tokens)) {
                          onTokenPairChange?.(tokens);
                          cookieStorage.setItem(
                            'tokenPair',
                            JSON.stringify(tokens),
                          );
                        }
                      })
                      .catch(() => {
                        onUnauthenticatedError?.();
                      }),
                  ).flatMap(() => forward(operation));
                }
                default:
                  if (isDebugMode === true) {
                    logDebug(
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

          if (isDefined(networkError)) {
            if (isDebugMode === true) {
              logDebug(`[Network error]: ${networkError}`);
            }
            onNetworkError?.(networkError);
          }
        },
      );

      return ApolloLink.from(
        [
          errorLink,
          authLink,
          ...(extraLinks || []),
          isDebugMode ? logger : null,
          retryLink,
          httpLink,
        ].filter(isDefined),
      );
    };

    this.client = new ApolloClient({
      ...options,
      link: buildApolloLink(),
    });
  }

  updateWorkspaceMember(workspaceMember: CurrentWorkspaceMember | null) {
    this.currentWorkspaceMember = workspaceMember;
  }

  getClient() {
    return this.client;
  }
}
