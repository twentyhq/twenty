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
  const eventIdKey = options.eventIdKey === null ? null : 'exceptionEventId';

  function addEventId(
    err: GraphQLError,
    eventId: string | undefined | null,
  ): GraphQLError {
    if (eventIdKey !== null && eventId) {
      err.extensions[eventIdKey] = eventId;
    }

    return err;
  }

  return {
    async onExecute({ args }) {
      const exceptionHandlerService = options.exceptionHandlerService;
      const rootOperation = args.document.definitions.find(
        (o) => o.kind === Kind.OPERATION_DEFINITION,
      ) as OperationDefinitionNode;
      const operationType = rootOperation.operation;
      const user = args.contextValue.req.user;
      const document = getDocumentString(args.document, print);
      const opName =
        args.operationName ||
        rootOperation.name?.value ||
        'Anonymous Operation';

      return {
        onExecuteDone(payload) {
          const handleResult: OnExecuteDoneHookResultOnNextHook<object> = ({
            result,
            setResult,
          }) => {
            if (result.errors && result.errors.length > 0) {
              const originalErrors = result.errors.map((error) => {
                const originalError = error.originalError;

                return originalError instanceof BaseGraphQLError
                  ? error.originalError
                  : generateGraphQLErrorFromError(error);
              });

              const errorsToCapture = originalErrors.reduce<BaseGraphQLError[]>(
                (acc, error) => {
                  if (shouldCaptureException(error)) {
                    acc.push(error);
                  }

                  return acc;
                },
                [],
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
                    workspace: {
                      id: args.contextValue.req.workspace?.id,
                      displayName: args.contextValue.req.workspace?.displayName,
                      createdAt:
                        args.contextValue.req.workspace?.createdAt.toISOString(),
                      activationStatus:
                        args.contextValue.req.workspace?.activationStatus,
                    },
                  },
                );

                errorsToCapture.map((err, i) => addEventId(err, eventIds?.[i]));
              }

              const nonCapturedErrors = originalErrors.filter(
                (error) => !errorsToCapture.includes(error),
              );

              setResult({
                ...result,
                errors: [...nonCapturedErrors, ...errorsToCapture],
              });
            }
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

        const requestMetadataVersion = headers['x-schema-version'];

        if (
          requestMetadataVersion &&
          requestMetadataVersion !== `${currentMetadataVersion}`
        ) {
          throw new GraphQLError(
            `Schema version mismatch, please refresh the page.`,
          );
        }
      }
    },
  };
};
