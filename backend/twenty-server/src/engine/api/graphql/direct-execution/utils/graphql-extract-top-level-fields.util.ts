import { type DocumentNode, type FieldNode, Kind } from 'graphql';

import { findOperationDefinition } from 'src/engine/api/graphql/direct-execution/utils/find-operation-definition.util';

export const graphQLExtractTopLevelFields = (
  document: DocumentNode,
  operationName: string | undefined,
): FieldNode[] => {
  const operationDefinition = findOperationDefinition(document, operationName);

  if (!operationDefinition) {
    return [];
  }

  return operationDefinition.selectionSet.selections.filter(
    (selection): selection is FieldNode => selection.kind === Kind.FIELD,
  );
};
