import { ApolloClient, ApolloLink, type ErrorLike } from '@apollo/client';
import {
  CombinedGraphQLErrors,
  ServerError,
  type ServerParseError,
} from '@apollo/client/errors';
import { setContext } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { from, switchMap } from 'rxjs';
import { RestLink } from 'apollo-link-rest';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';

import { renewToken } from '@/auth/services/AuthService';
import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type AuthTokenPair } from '~/generated-metadata/graphql';
import { logDebug } from '~/utils/logDebug';

import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { type ApolloManager } from '@/apollo/types/apolloManager.interface';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { loggerLink } from '@/apollo/utils/loggerLink';
import { StreamingRestLink } from '@/apollo/utils/streamingRestLink';
import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
import {
  type DefinitionNode,
  type DirectiveNode,
  type GraphQLFormattedError,
  type SelectionNode,
} from 'graphql';
import isEmpty from 'lodash.isempty';
import { getGenericOperationName, isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { cookieStorage } from '~/utils/cookie-storage';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const logger = loggerLink(() => 'Twenty');

// Shared across all ApolloFactory instances so concurrent
// UNAUTHENTICATED errors from /graphql and /metadata clients
// deduplicate into a single renewal request.
let renewalPromise: Promise<void> | null = null;

export interface Options {
  uri: string;
  cache: ApolloClient.Options['cache'];
  defaultOptions?: ApolloClient.Options['defaultOptions'];
  headers?: Record<string, string>;
  devtools?: { enabled?: boolean };
  onError?: (err: readonly GraphQLFormattedError[] | undefined) => void;
  onNetworkError?: (err: Error | ServerParseError | ServerError) => void;
  onTokenPairChange?: (tokenPair: AuthTokenPair) => void;
  onUnauthenticatedError?: () => void;
  onAppVersionMismatch?: (message: string) => void;
  onPayloadTooLarge?: (message: string) => void;
  currentWorkspaceMember: CurrentWorkspaceMember | null;
  currentWorkspace: CurrentWorkspace | null;
  extraLinks?: ApolloLink[];
  isDebugMode?: boolean;
  appVersion?: string;
}

export class ApolloFactory implements ApolloManager {
  private client: ApolloClient;
  private currentWorkspaceMember: CurrentWorkspaceMember | null = null;
  private currentWorkspace: CurrentWorkspace | null = null;
  private appVersion?: string;

  constructor(opts: Options) {
    const {
      uri,
      cache,
      defaultOptions,
      headers: optionHeaders,
      devtools,
      onError: onErrorCb,
      onNetworkError,
      onTokenPairChange,
      onUnauthenticatedError,
      onAppVersionMismatch,
      onPayloadTooLarge,
      currentWorkspaceMember,
      currentWorkspace,
      extraLinks,
      isDebugMode,
      appVersion,
    } = opts;

    this.currentWorkspaceMember = currentWorkspaceMember;
    this.currentWorkspace = currentWorkspace;
    this.appVersion = appVersion;

    const buildApolloLink = (): ApolloLink => {
      const uploadLink = new UploadHttpLink({
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

        const locale = this.currentWorkspaceMember?.locale ?? i18n.locale;

        if (isUndefinedOrNull(tokenPair)) {
          return {
            headers: {
              ...headers,
              ...optionHeaders,
              'x-locale': locale,
            },
          };
        }

        const token = tokenPair.accessOrWorkspaceAgnosticToken?.token;

        return {
          headers: {
            ...headers,
            ...optionHeaders,
            authorization: token ? `Bearer ${token}` : '',
            'x-locale': locale,
            ...(this.currentWorkspace?.metadataVersion && {
              'X-Schema-Version': `${this.currentWorkspace.metadataVersion}`,
            }),
            ...(this.appVersion && { 'X-App-Version': this.appVersion }),
          },
        };
      });

      const retryLink = new RetryLink({
        delay: {
          initial: 3000,
        },
        attempts: {
          max: 2,
          retryIf: (error) => {
            // oxlint-disable-next-line no-console
            console.log('retryIf error from retryLink', error);
            if (this.isAuthenticationError(error)) {
              return false;
            }
            if (this.isPayloadTooLargeError(error)) {
              return false;
            }
            return Boolean(error);
          },
        },
      });

      const handleTokenRenewal = (
        operation: ApolloLink.Operation,
        forward: ApolloLink.ForwardFunction,
      ) => {
        if (!renewalPromise) {
          // Always renew through /metadata since the RenewToken is only exposed there
          const graphqlUri = `${REACT_APP_SERVER_BASE_URL}/metadata`;

          renewalPromise = renewToken(graphqlUri, getTokenPair())
            .then((tokens) => {
              if (isDefined(tokens)) {
                // oxlint-disable-next-line no-console
                console.log('setTokenPair from handleTokenRenewal');
                onTokenPairChange?.(tokens);
                cookieStorage.setItem('tokenPair', JSON.stringify(tokens));
              }
            })
            .catch(() => {
              // oxlint-disable-next-line no-console
              console.log(
                'Failed to renew token, triggering unauthenticated error from handleTokenRenewal',
              );
              onUnauthenticatedError?.();
            })
            .finally(() => {
              renewalPromise = null;
            });
        }

        return from(renewalPromise).pipe(
          switchMap(() => forward(operation)),
        );
      };

      const sendToSentry = ({
        graphQLError,
        operation,
      }: {
        graphQLError: GraphQLFormattedError;
        operation: ApolloLink.Operation;
      }) => {
        if (isDebugMode === true) {
          logDebug(
            `[GraphQL error]: Message: ${graphQLError.message}, Location: ${
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
                if (isDefined(graphQLError.extensions.subCode)) {
                  fingerPrint.push(graphQLError.extensions.subCode as string);
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
            // oxlint-disable-next-line no-console
            console.error(
              'Failed to capture GraphQL error with Sentry:',
              sentryError,
            );
          });
      };

      const errorLink = new ErrorLink(
        ({ error, operation, forward }) => {
          if (CombinedGraphQLErrors.is(error)) {
            onErrorCb?.(error.errors);
            for (const graphQLError of error.errors) {
              if (graphQLError.message === 'Unauthorized') {
                // oxlint-disable-next-line no-console
                console.log('Unauthorized, triggering token renewal');
                return handleTokenRenewal(operation, forward);
              }

              switch (graphQLError?.extensions?.code) {
                case 'APP_VERSION_MISMATCH': {
                  onAppVersionMismatch?.(
                    (graphQLError.extensions?.userFriendlyMessage as string) ||
                      t`Your app version is out of date. Please refresh the page.`,
                  );
                  return;
                }
                case 'UNAUTHENTICATED': {
                  // oxlint-disable-next-line no-console
                  console.log('UNAUTHENTICATED, triggering token renewal');
                  return handleTokenRenewal(operation, forward);
                }
                case 'NOT_FOUND':
                case 'BAD_USER_INPUT':
                case 'FORBIDDEN':
                case 'CONFLICT':
                case 'METADATA_VALIDATION_FAILED': {
                  return;
                }
                case 'USER_INPUT_ERROR': {
                  if (graphQLError.extensions?.isExpected === true) {
                    return;
                  }
                  sendToSentry({ graphQLError, operation });
                  return;
                }
                case 'INTERNAL_SERVER_ERROR': {
                  return; // already caught in BE
                }
                default:
                  sendToSentry({ graphQLError, operation });
              }
            }
          } else if (ServerError.is(error)) {
            if (
              this.isRestOperation(operation) &&
              this.isAuthenticationError(error)
            ) {
              // oxlint-disable-next-line no-console
              console.log(
                'Authentication error, triggering token renewal from errorLink',
              );
              return handleTokenRenewal(operation, forward);
            }

            if (this.isPayloadTooLargeError(error)) {
              onPayloadTooLarge?.(t`Uploaded content is too large.`);
              return;
            }

            if (isDebugMode === true) {
              logDebug(`[Network error]: ${error}`);
            }
            onNetworkError?.(error);
          } else if (isDefined(error)) {
            if (isDebugMode === true) {
              logDebug(`[Network error]: ${error}`);
            }
            onNetworkError?.(error as Error);
          }
        },
      );

      // Type assertion needed because third-party link packages (apollo-link-rest,
      // apollo-upload-client) reference their own @apollo/client ApolloLink type
      const links = [
        errorLink,
        authLink,
        ...(extraLinks || []),
        ...(isDebugMode ? [logger] : []),
        retryLink,
        streamingRestLink,
        restLink,
        uploadLink,
      ] as ApolloLink[];

      return ApolloLink.from(links);
    };

    this.client = new ApolloClient({
      cache,
      link: buildApolloLink(),
      defaultOptions,
      devtools,
    });
  }

  private isRestOperation(operation: ApolloLink.Operation): boolean {
    return operation.query.definitions.some(
      (def: DefinitionNode) =>
        def.kind === 'OperationDefinition' &&
        def.selectionSet?.selections.some(
          (selection: SelectionNode) =>
            selection.kind === 'Field' &&
            selection.directives?.some(
              (directive: DirectiveNode) =>
                directive.name.value === 'rest' ||
                directive.name.value === 'stream',
            ),
        ),
    );
  }

  private isAuthenticationError(error: ErrorLike): boolean {
    return ServerError.is(error) && error.statusCode === 401;
  }

  private isPayloadTooLargeError(error: ErrorLike): boolean {
    return ServerError.is(error) && error.statusCode === 413;
  }

  updateWorkspaceMember(workspaceMember: CurrentWorkspaceMember | null) {
    this.currentWorkspaceMember = workspaceMember;
  }

  updateCurrentWorkspace(workspace: CurrentWorkspace | null) {
    this.currentWorkspace = workspace;
  }

  updateAppVersion(appVersion?: string) {
    this.appVersion = appVersion;
  }

  getClient() {
    return this.client;
  }
}
