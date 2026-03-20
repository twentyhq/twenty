import { DocumentNode, FragmentDefinitionNode, Kind } from 'graphql';

export const graphQLBuildFragmentMap = (
  document: DocumentNode,
): Map<string, FragmentDefinitionNode> => {
  const map = new Map<string, FragmentDefinitionNode>();

  for (const definition of document.definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      map.set(definition.name.value, definition);
    }
  }

  return map;
};
