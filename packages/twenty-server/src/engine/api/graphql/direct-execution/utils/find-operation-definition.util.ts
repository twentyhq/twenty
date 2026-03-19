import { type DocumentNode, type OperationDefinitionNode, Kind } from 'graphql';

export const findOperationDefinition = (
  document: DocumentNode,
  operationName: string | undefined,
): OperationDefinitionNode | undefined => {
  const operations = document.definitions.filter(
    (definition): definition is OperationDefinitionNode =>
      definition.kind === Kind.OPERATION_DEFINITION,
  );

  if (operationName) {
    return operations.find(
      (operation) => operation.name?.value === operationName,
    );
  }

  return operations[0];
};
