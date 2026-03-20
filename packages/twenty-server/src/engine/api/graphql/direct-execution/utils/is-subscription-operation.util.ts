import { type DocumentNode } from 'graphql';

import { findOperationDefinition } from 'src/engine/api/graphql/direct-execution/utils/find-operation-definition.util';

export const isSubscriptionOperation = (
  document: DocumentNode,
  operationName: string | undefined,
): boolean => {
  const operation = findOperationDefinition(document, operationName);

  return operation?.operation === 'subscription';
};
