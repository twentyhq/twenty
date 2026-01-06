import {
  getDocumentString,
  handleStreamOrSingleExecutionResult,
  type OnExecuteDoneHookResultOnNextHook,
  type Plugin,
} from '@envelop/core';
import { msg } from '@lingui/core/macro';
import {
  GraphQLError,
  Kind,
  type OperationDefinitionNode,
  print,
} from 'graphql';
import semver from 'semver';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { type GraphQLContext } from 'src/engine/api/graphql/graphql-config/interfaces/graphql-context.interface';

import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { generateGraphQLErrorFromError } from 'src/engine/core-modules/graphql/utils/generate-graphql-error-from-error.util';
import {
  BaseGraphQLError,
  convertGraphQLErrorToBaseGraphQLError,
  ErrorCode,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  graphQLErrorCodesToFilter,
  shouldCaptureException,
} from 'src/engine/utils/global-exception-handler.util';

const DEFAULT_EVENT_ID_KEY = 'exceptionEventId';
const SCHEMA_VERSION_HEADER = 'x-schema-version';
const SCHEMA_MISMATCH_ERROR = 'Schema version mismatch.';
const APP_VERSION_HEADER = 'x-app-version';
const APP_VERSION_MISMATCH_ERROR = 'App version mismatch.';
const APP_VERSION_MISMATCH_CODE = 'APP_VERSION_MISMATCH';

type GraphQLErrorHandlerHookOptions = {
  metricsService: MetricsService;

  /**
   * The exception handler service to use.
   */
  exceptionHandlerService: ExceptionHandlerService;

  i18nService: I18nService;

  twentyConfigService: TwentyConfigService;
  /**
   * The key of the event id in the error's extension. `null` to disable.
   * @default exceptionEventId
   */
  eventIdKey?: string | null;
};

export const useGraphQLErrorHandlerHook = <
  PluginContext extends GraphQLContext,
>(
  options: GraphQLErrorHandlerHookOptions,
): Plugin<PluginContext> => {
  const eventIdKey = options.eventIdKey === null ? null : DEFAULT_EVENT_ID_KEY;

  function extractWorkspaceInfo(req: GraphQLContext['req']) {
    if (!req.workspace) {
      return null;
    }

    return {
      id: req.workspace.id,
      displayName: req.workspace.displayName,
      createdAt: req.workspace.createdAt?.toISOString() ?? null,
      activationStatus: req.workspace.activationStatus,
    };
  }

  return {
    async onExecute({ args }) {
      const exceptionHandlerService = options.exceptionHandlerService;
      const rootOperation = args.document.definitions.find(
        // @ts-expect-error legacy noImplicitAny
        (o) => o.kind === Kind.OPERATION_DEFINITION,
      ) as OperationDefinitionNode;

      if (!rootOperation) {
        return;
      }

      const operationType = rootOperation.operation;
      const user = args.contextValue.req.user;
      const document = getDocumentString(args.document, print);
      const opName =
        args.operationName ||
        rootOperation.name?.value ||
        'Anonymous Operation';
      const workspaceInfo = extractWorkspaceInfo(args.contextValue.req);

      return {
        onExecuteDone(payload) {
          const handleResult: OnExecuteDoneHookResultOnNextHook<object> = ({
            result,
            setResult,
          }) => {
            if (!result.errors || result.errors.length === 0) {
              options.metricsService.incrementCounter({
                key: MetricsKeys.GraphqlOperation200,
              });

              return;
            }

            // Step 1: Process errors - extract original errors and convert to BaseGraphQLError
            const processedErrors = result.errors.map((error) => {
              const originalError = error.originalError || error;

              if (error.extensions && originalError !== error) {
                originalError.extensions = {
                  ...error.extensions,
                  ...(originalError.extensions || {}),
                };
              }

              if (
                originalError instanceof GraphQLError &&
                !(originalError instanceof BaseGraphQLError)
              ) {
                return convertGraphQLErrorToBaseGraphQLError(originalError);
              }

              return originalError;
            });

            // Error metrics
            const codeToMetricKey: Partial<Record<ErrorCode, MetricsKeys>> = {
              [ErrorCode.UNAUTHENTICATED]: MetricsKeys.GraphqlOperation401,
              [ErrorCode.FORBIDDEN]: MetricsKeys.GraphqlOperation403,
              [ErrorCode.NOT_FOUND]: MetricsKeys.GraphqlOperation404,
              [ErrorCode.INTERNAL_SERVER_ERROR]:
                MetricsKeys.GraphqlOperation500,
            };

            const statusToMetricKey: Record<number, MetricsKeys> = {
              400: MetricsKeys.GraphqlOperation400,
              401: MetricsKeys.GraphqlOperation401,
              403: MetricsKeys.GraphqlOperation403,
              404: MetricsKeys.GraphqlOperation404,
              500: MetricsKeys.GraphqlOperation500,
            };

            processedErrors.forEach((error) => {
              let metricKey: MetricsKeys | undefined;

              if (error instanceof BaseGraphQLError) {
                const code = error.extensions?.code as ErrorCode;

                metricKey = codeToMetricKey[code];
                if (!metricKey && graphQLErrorCodesToFilter.includes(code)) {
                  metricKey = MetricsKeys.GraphqlOperation400;
                }
              } else if (error instanceof GraphQLError) {
                const status = error.extensions?.http?.status as number;

                metricKey = statusToMetricKey[status];
              }

              if (metricKey) {
                options.metricsService.incrementCounter({ key: metricKey });
              } else {
                options.metricsService.incrementCounter({
                  key: MetricsKeys.GraphqlOperationUnknown,
                });
              }
            });

            // Step 2: Send errors to monitoring service (with stack traces)
            const errorsToCapture = processedErrors.filter(
              shouldCaptureException,
            );

            if (errorsToCapture.length > 0) {
              const eventIds = exceptionHandlerService.captureExceptions(
                errorsToCapture,
                {
                  operation: {
                    name: opName,
                    type: operationType,
                  },
                  document,
                  user,
                  workspace: workspaceInfo,
                },
              );

              errorsToCapture.forEach((_, i) => {
                if (eventIds?.[i] && eventIdKey !== null) {
                  processedErrors[
                    processedErrors.indexOf(errorsToCapture[i])
                  ].eventId = eventIds[i];
                }
              });
            }

            // Step 3: Transform errors for GraphQL response (clean GraphQL errors)
            const userLocale = args.contextValue.req.locale ?? SOURCE_LOCALE;
            const i18n = options.i18nService.getI18nInstance(userLocale);
            const defaultErrorMessage = msg`An error occurred.`;

            const transformedErrors = processedErrors.map((error) => {
              const graphqlError =
                error instanceof BaseGraphQLError
                  ? {
                      ...error,
                      extensions: {
                        ...error.extensions,
                        userFriendlyMessage: i18n._(
                          error.extensions.userFriendlyMessage ??
                            defaultErrorMessage,
                        ),
                      },
                    }
                  : generateGraphQLErrorFromError(error, i18n);

              if (error.eventId && eventIdKey) {
                graphqlError.extensions = {
                  ...graphqlError.extensions,
                  [eventIdKey]: error.eventId,
                };
              }

              return graphqlError;
            });

            setResult({
              ...result,
              errors: transformedErrors,
            });
          };

          return handleStreamOrSingleExecutionResult(payload, handleResult);
        },
      };
    },

    onValidate: ({ context, validateFn, params: { documentAST, schema } }) => {
      const errors = validateFn(schema, documentAST);

      const userLocale = context.req.locale ?? SOURCE_LOCALE;
      const i18n = options.i18nService.getI18nInstance(userLocale);

      if (Array.isArray(errors) && errors.length > 0) {
        const headers = context.req.headers;
        const currentMetadataVersion = context.req.workspaceMetadataVersion;
        const requestMetadataVersion = headers[SCHEMA_VERSION_HEADER];
        const backendAppVersion =
          options.twentyConfigService.get('APP_VERSION');
        const appVersionHeaderValue = headers[APP_VERSION_HEADER];
        const frontEndAppVersion =
          appVersionHeaderValue && Array.isArray(appVersionHeaderValue)
            ? appVersionHeaderValue[0]
            : appVersionHeaderValue;

        if (
          requestMetadataVersion &&
          isDefined(currentMetadataVersion) &&
          requestMetadataVersion !== `${currentMetadataVersion}`
        ) {
          options.metricsService.incrementCounter({
            key: MetricsKeys.SchemaVersionMismatch,
          });

          throw new GraphQLError(SCHEMA_MISMATCH_ERROR, {
            extensions: {
              userFriendlyMessage: i18n._(
                msg`Your workspace has been updated with a new data model. Please refresh the page.`,
              ),
            },
          });
        }

        if (
          !frontEndAppVersion ||
          !backendAppVersion ||
          !semver.valid(frontEndAppVersion) ||
          !semver.valid(backendAppVersion)
        ) {
          return;
        }

        const frontEndMajor = semver.parse(frontEndAppVersion)?.major;
        const backendMajor = semver.parse(backendAppVersion)?.major;

        if (
          isDefined(frontEndMajor) &&
          isDefined(backendMajor) &&
          frontEndMajor < backendMajor
        ) {
          options.metricsService.incrementCounter({
            key: MetricsKeys.AppVersionMismatch,
          });
          throw new GraphQLError(APP_VERSION_MISMATCH_ERROR, {
            extensions: {
              code: APP_VERSION_MISMATCH_CODE,
              userFriendlyMessage: i18n._(
                msg`Your app version is out of date. Please refresh the page to continue.`,
              ),
            },
          });
        }
      }
    },
  };
};
