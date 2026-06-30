import { type DocumentNode } from 'graphql';

// Replaces getOperationName from @apollo/client/utilities (removed in Apollo v4)
export const getOperationName = (
  document: DocumentNode,
): string | undefined => {
  for (const definition of document.definitions) {
    if (definition.kind === 'OperationDefinition' && definition.name) {
      return definition.name.value;
    }
  }
  return undefined;
};
