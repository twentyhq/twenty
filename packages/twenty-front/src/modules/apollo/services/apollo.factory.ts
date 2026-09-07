import { ApolloClient, ApolloLink, type ErrorLike } from '@apollo/client';
import {
  CombinedGraphQLErrors,
  ServerError,
  type ServerParseError,
} from '@apollo/client/errors';
import { setContext } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { RestLink } from 'apollo-link-rest';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';

import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { logDebug } from '~/utils/logDebug';

import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { type ApolloManager } from '@/apollo/types/apolloManager.interface';
import { isUnauthenticatedGraphQLError } from '@/apollo/utils/isUnauthenticatedGraphQLError';
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

const logger = loggerLink(() => 'Twenty');

export interface Options {
  uri: string;
  cache: ApolloClient.Options['cache'];
  defaultOptions?: ApolloClient.Options['defaultOptions'];
  headers?: Record<string, string>;
  devtools?: { enabled?: boolean };
  onError?: (err: readonly GraphQLFormattedError[] | undefined) => void;
  onNetworkError?: (err: Error | ServerParseError | ServerError) => void;
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
        credentials: 'include',
      });

      const streamingRestLink = new StreamingRestLink({
        uri: REST_API_BASE_URL,
        credentials: 'include',
      });

      const restLink = new RestLink({
        uri: REST_API_BASE_URL,
        credentials: 'include',
      });

      const authLink = setContext(async (_, { headers }) => {
        const locale = this.currentWorkspaceMember?.locale ?? i18n.locale;

        return {
          headers: {
            ...headers,
            ...optionHeaders,
            'x-locale': locale,
            ...(isDefined(this.appVersion) && {
              'X-App-Version': this.appVersion,
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
          retryIf: (error, operation) => {
            // oxlint-disable-next-line no-console
            console.log('retryIf error from retryLink', error);
            // A retry is a fresh request seconds later, so it carries whatever
            // cookie exists by then rather than the one that was current when
            // the operation was issued. See PendingServerSignOutEffect.
            if (operation.getContext().skipRetry === true) {
              return false;
            }
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

      const errorLink = new ErrorLink(({ error, operation }) => {
        if (CombinedGraphQLErrors.is(error)) {
          onErrorCb?.(error.errors);
          for (const graphQLError of error.errors) {
            if (isUnauthenticatedGraphQLError(graphQLError)) {
              onUnauthenticatedError?.();

              return;
            }

            switch (graphQLError?.extensions?.code) {
              case 'APP_VERSION_MISMATCH': {
                onAppVersionMismatch?.(
                  (graphQLError.extensions?.userFriendlyMessage as string) ||
                    t`Your app version is out of date. Please refresh the page.`,
                );
                return;
              }
              case 'NOT_FOUND':
              case 'BAD_USER_INPUT':
              case 'FORBIDDEN':
              case 'CONFLICT':
              case 'METADATA_VALIDATION_FAILED':
              case 'RATE_LIMITED':
              case 'QUOTA_EXHAUSTED': {
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
            onUnauthenticatedError?.();

            return;
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
      });

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
