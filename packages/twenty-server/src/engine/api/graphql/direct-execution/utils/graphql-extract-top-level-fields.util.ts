import { type DocumentNode, type FieldNode, Kind } from 'graphql';

import { findOperationDefinition } from 'src/engine/api/graphql/direct-execution/utils/find-operation-definition.util';
import { graphQLBuildFragmentMap } from 'src/engine/api/graphql/direct-execution/utils/graphql-build-fragment-map.util';

export const graphQLExtractTopLevelFields = (
  document: DocumentNode,
  operationName: string | undefined,
): FieldNode[] => {
  const operationDefinition = findOperationDefinition(document, operationName);

  if (!operationDefinition) {
    return [];
  }

  const fragmentMap = graphQLBuildFragmentMap(document);
  const fields: FieldNode[] = [];

  for (const selection of operationDefinition.selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      fields.push(selection);
    } else if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = fragmentMap.get(selection.name.value);

      if (fragment) {
        for (const fragmentSelection of fragment.selectionSet.selections) {
          if (fragmentSelection.kind === Kind.FIELD) {
            fields.push(fragmentSelection);
          }
        }
      }
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      for (const inlineSelection of selection.selectionSet.selections) {
        if (inlineSelection.kind === Kind.FIELD) {
          fields.push(inlineSelection);
        }
      }
    }
  }

  return fields;
};
