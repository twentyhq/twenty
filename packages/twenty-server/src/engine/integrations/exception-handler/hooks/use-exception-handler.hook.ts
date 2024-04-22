import { GraphQLError, Kind, OperationDefinitionNode, print } from 'graphql';
import {
  getDocumentString,
  handleStreamOrSingleExecutionResult,
  OnExecuteDoneHookResultOnNextHook,
  Plugin,
} from '@envelop/core';

import { GraphQLContext } from 'src/engine/api/graphql/graphql-config/interfaces/graphql-context.interface';

import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';
import {
  convertExceptionToGraphQLError,
  filterException,
} from 'src/engine/utils/global-exception-handler.util';

export type ExceptionHandlerPluginOptions = {
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

export const useExceptionHandler = <PluginContext extends GraphQLContext>(
  options: ExceptionHandlerPluginOptions,
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
              const exceptions = result.errors.reduce<{
                filtered: any[];
                unfiltered: any[];
              }>(
                (acc, err) => {
                  // Filter out exceptions that we don't want to be captured by exception handler
                  if (filterException(err?.originalError ?? err)) {
                    acc.filtered.push(err);
                  } else {
                    acc.unfiltered.push(err);
                  }

                  return acc;
                },
                {
                  filtered: [],
                  unfiltered: [],
                },
              );

              if (exceptions.unfiltered.length > 0) {
                const eventIds = exceptionHandlerService.captureExceptions(
                  exceptions.unfiltered,
                  {
                    operation: {
                      name: opName,
                      type: operationType,
                    },
                    document,
                    user,
                  },
                );

                exceptions.unfiltered.map((err, i) =>
                  addEventId(err, eventIds?.[i]),
                );
              }

              const concatenatedErrors = [
                ...exceptions.filtered,
                ...exceptions.unfiltered,
              ];
              const errors = concatenatedErrors.map((err) => {
                // Properly convert errors to GraphQLErrors
                const graphQLError = convertExceptionToGraphQLError(
                  err.originalError,
                );

                return graphQLError;
              });

              setResult({
                ...result,
                errors,
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
        const currentSchemaVersion = context.req.cacheVersion;

        const requestSchemaVersion = headers['x-schema-version'];

        if (
          requestSchemaVersion &&
          requestSchemaVersion !== currentSchemaVersion
        ) {
          throw new GraphQLError(
            `Schema version mismatch, please refresh the page.`,
          );
        }
      }
    },
  };
};
