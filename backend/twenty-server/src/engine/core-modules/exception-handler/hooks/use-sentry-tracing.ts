import * as Sentry from '@sentry/node';
import {
  handleStreamOrSingleExecutionResult,
  type Plugin,
  getDocumentString,
} from '@envelop/core';
import { type OperationDefinitionNode, Kind, print } from 'graphql';

import { type GraphQLContext } from 'src/engine/api/graphql/graphql-config/graphql-config.service';

export const useSentryTracing = <
  PluginContext extends GraphQLContext,
>(): Plugin<PluginContext> => {
  return {
    onExecute({ args }) {
      const transactionName = args.operationName || 'Anonymous Operation';
      const rootOperation = args.document.definitions.find(
        // @ts-expect-error legacy noImplicitAny
        (o) => o.kind === Kind.OPERATION_DEFINITION,
      ) as OperationDefinitionNode;
      const operationType = rootOperation.operation;

      const user = args.contextValue.user;
      const workspace = args.contextValue.workspace;
      const document = getDocumentString(args.document, print);

      Sentry.setTags({
        operationName: transactionName,
        operation: operationType,
      });

      const scope = Sentry.getCurrentScope();

      scope.setTransactionName(transactionName);

      if (user) {
        scope.setUser({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          workspaceId: workspace?.id,
          workspaceDisplayName: workspace?.displayName,
        });
      }

      if (document) {
        scope.setExtra('document', document);
      }

      return {
        onExecuteDone(payload) {
          return handleStreamOrSingleExecutionResult(payload, () => {});
        },
      };
    },
  };
};
