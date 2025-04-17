import {
  OnExecuteDoneHookResultOnNextHook,
  Plugin,
  getDocumentString,
  handleStreamOrSingleExecutionResult,
} from '@envelop/core';
import { GraphQLError, Kind, OperationDefinitionNode, print } from 'graphql';

import { GraphQLContext } from 'src/engine/api/graphql/graphql-config/interfaces/graphql-context.interface';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { generateGraphQLErrorFromError } from 'src/engine/core-modules/graphql/utils/generate-graphql-error-from-error.util';
import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { shouldCaptureException } from 'src/engine/core-modules/graphql/utils/should-capture-exception.util';

const DEFAULT_EVENT_ID_KEY = 'exceptionEventId';
const SCHEMA_VERSION_HEADER = 'x-schema-version';
const SCHEMA_MISMATCH_ERROR =
  'Your workspace has been updated with a new data model. Please refresh the page.';

type GraphQLErrorHandlerHookOptions = {
  /**
   * The exception handler service to use.
   */
  exceptionHandlerService: ExceptionHandlerService;
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
              return;
            }

            // Step 1: Flatten errors - extract original errors when available
            const originalErrors = result.errors.map((error) => {
              return error.originalError || error;
            });

            // Step 2: Send errors to monitoring service (with stack traces)
            const errorsToCapture = originalErrors.filter(
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
                  originalErrors[
                    originalErrors.indexOf(errorsToCapture[i])
                  ].eventId = eventIds[i];
                }
              });
            }

            // Step 3: Transform errors for GraphQL response (clean GraphQL errors)
            const transformedErrors = originalErrors.map((error) => {
              const graphqlError =
                error instanceof BaseGraphQLError
                  ? error
                  : generateGraphQLErrorFromError(error);

              if (error.eventId && eventIdKey) {
                graphqlError.extensions[eventIdKey] = error.eventId;
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

      if (Array.isArray(errors) && errors.length > 0) {
        const headers = context.req.headers;
        const currentMetadataVersion = context.req.workspaceMetadataVersion;
        const requestMetadataVersion = headers[SCHEMA_VERSION_HEADER];

        if (
          requestMetadataVersion &&
          requestMetadataVersion !== `${currentMetadataVersion}`
        ) {
          throw new GraphQLError(SCHEMA_MISMATCH_ERROR);
        }
      }
    },
  };
};
