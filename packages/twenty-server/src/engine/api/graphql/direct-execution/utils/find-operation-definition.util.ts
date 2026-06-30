import {
  type DocumentNode,
  type OperationDefinitionNode,
  GraphQLError,
  Kind,
} from 'graphql';

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

  if (operations.length > 1) {
    throw new GraphQLError(
      'Must provide operation name when document contains multiple operations.',
    );
  }

  return operations[0];
};
