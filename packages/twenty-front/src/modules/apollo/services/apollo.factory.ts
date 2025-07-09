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
import { RestLink } from 'apollo-link-rest';
import { createUploadLink } from 'apollo-upload-client';

import { renewToken } from '@/auth/services/AuthService';
import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { AuthTokenPair } from '~/generated/graphql';
import { logDebug } from '~/utils/logDebug';

import { i18n } from '@lingui/core';
import { GraphQLFormattedError } from 'graphql';
import isEmpty from 'lodash.isempty';
import { getGenericOperationName, isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { cookieStorage } from '~/utils/cookie-storage';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { ApolloManager } from '../types/apolloManager.interface';
import { getTokenPair } from '../utils/getTokenPair';
import { loggerLink } from '../utils/loggerLink';
import { StreamingRestLink } from '../utils/streamingRestLink';

const logger = loggerLink(() => 'Twenty');

export interface Options<TCacheShape> extends ApolloClientOptions<TCacheShape> {
  onError?: (err: readonly GraphQLFormattedError[] | undefined) => void;
  onNetworkError?: (err: Error | ServerParseError | ServerError) => void;
  onTokenPairChange?: (tokenPair: AuthTokenPair) => void;
  onUnauthenticatedError?: () => void;
  currentWorkspaceMember: CurrentWorkspaceMember | null;
  currentWorkspace: CurrentWorkspace | null;
  extraLinks?: ApolloLink[];
  isDebugMode?: boolean;
}

const REST_API_BASE_URL = `${REACT_APP_SERVER_BASE_URL}/rest`;

export class ApolloFactory<TCacheShape> implements ApolloManager<TCacheShape> {
  private client: ApolloClient<TCacheShape>;
  private currentWorkspaceMember: CurrentWorkspaceMember | null = null;
  private currentWorkspace: CurrentWorkspace | null = null;

  constructor(opts: Options<TCacheShape>) {
    const {
      uri,
      onError: onErrorCb,
      onNetworkError,
      onTokenPairChange,
      onUnauthenticatedError,
      currentWorkspaceMember,
      currentWorkspace,
      extraLinks,
      isDebugMode,
      ...options
    } = opts;

    this.currentWorkspaceMember = currentWorkspaceMember;
    this.currentWorkspace = currentWorkspace;

    const buildApolloLink = (): ApolloLink => {
      const httpLink = createUploadLink({
        uri,
      });

      const streamingRestLink = new StreamingRestLink({
        uri: REST_API_BASE_URL,
      });

      const restLink = new RestLink({
        uri: REST_API_BASE_URL,
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
            ...(this.currentWorkspace?.metadataVersion && {
              'X-Schema-Version': `${this.currentWorkspace.metadataVersion}`,
            }),
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
                case 'FORBIDDEN': {
                  return;
                }
                case 'INTERNAL_SERVER_ERROR': {
                  return; // already caught in BE
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
                  import('@sentry/react')
                    .then(({ captureException, withScope }) => {
                      withScope((scope) => {
                        const error = new Error(graphQLError.message);

                        error.name = graphQLError.message;

                        const fingerPrint: string[] = [];
                        if (isDefined(graphQLError.extensions)) {
                          scope.setExtra('extensions', graphQLError.extensions);
                          if (isDefined(graphQLError.extensions.code)) {
                            fingerPrint.push(
                              graphQLError.extensions.code as string,
                            );
                          }
                        }

                        if (isDefined(operation.operationName)) {
                          scope.setExtra('operation', operation.operationName);
                          const genericOperationName = getGenericOperationName(
                            operation.operationName,
                          );

                          if (isDefined(genericOperationName)) {
                            fingerPrint.push(genericOperationName);
                          }
                        }

                        if (!isEmpty(fingerPrint)) {
                          scope.setFingerprint(fingerPrint);
                        }

                        captureException(error); // Sentry expects a JS error
                      });
                    })
                    .catch((sentryError) => {
                      // eslint-disable-next-line no-console
                      console.error(
                        'Failed to capture GraphQL error with Sentry:',
                        sentryError,
                      );
                    });
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
          streamingRestLink,
          restLink,
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

  updateCurrentWorkspace(workspace: CurrentWorkspace | null) {
    this.currentWorkspace = workspace;
  }

  getClient() {
    return this.client;
  }
}
