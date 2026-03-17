import {
  type DocumentNode,
  type FragmentDefinitionNode,
  type SelectionSetNode,
  Kind,
} from 'graphql';

// Matches the output format of the `graphql-fields` npm package:
// leaf fields → {}, nested fields → recursive objects, __typename excluded
export const selectionSetToSelectedFields = (
  selectionSet: SelectionSetNode | undefined,
  fragmentMap: Map<string, FragmentDefinitionNode>,
): Record<string, object> => {
  if (!selectionSet) {
    return {};
  }

  const result: Record<string, object> = {};

  for (const selection of selectionSet.selections) {
    switch (selection.kind) {
      case Kind.FIELD: {
        if (selection.name.value === '__typename') {
          continue;
        }

        const key = selection.name.value;

        if (selection.selectionSet) {
          const nested = selectionSetToSelectedFields(
            selection.selectionSet,
            fragmentMap,
          );

          result[key] = deepMerge(
            (result[key] as Record<string, object>) ?? {},
            nested,
          );
        } else {
          result[key] = result[key] ?? {};
        }

        break;
      }

      case Kind.FRAGMENT_SPREAD: {
        const fragment = fragmentMap.get(selection.name.value);

        if (fragment) {
          const fragmentFields = selectionSetToSelectedFields(
            fragment.selectionSet,
            fragmentMap,
          );

          deepMergeInto(result, fragmentFields);
        }

        break;
      }

      case Kind.INLINE_FRAGMENT: {
        const inlineFields = selectionSetToSelectedFields(
          selection.selectionSet,
          fragmentMap,
        );

        deepMergeInto(result, inlineFields);

        break;
      }
    }
  }

  return result;
};

export const buildFragmentMap = (
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

const deepMerge = (
  target: Record<string, object>,
  source: Record<string, object>,
): Record<string, object> => {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (
      result[key] &&
      typeof result[key] === 'object' &&
      typeof source[key] === 'object' &&
      Object.keys(result[key]).length > 0 &&
      Object.keys(source[key]).length > 0
    ) {
      result[key] = deepMerge(
        result[key] as Record<string, object>,
        source[key] as Record<string, object>,
      );
    } else if (
      typeof source[key] === 'object' &&
      Object.keys(source[key]).length > 0
    ) {
      result[key] = source[key];
    } else {
      result[key] = result[key] ?? source[key];
    }
  }

  return result;
};

const deepMergeInto = (
  target: Record<string, object>,
  source: Record<string, object>,
): void => {
  for (const key of Object.keys(source)) {
    if (
      target[key] &&
      typeof target[key] === 'object' &&
      typeof source[key] === 'object' &&
      Object.keys(target[key]).length > 0 &&
      Object.keys(source[key]).length > 0
    ) {
      target[key] = deepMerge(
        target[key] as Record<string, object>,
        source[key] as Record<string, object>,
      );
    } else if (
      typeof source[key] === 'object' &&
      Object.keys(source[key]).length > 0
    ) {
      target[key] = source[key];
    } else {
      target[key] = target[key] ?? source[key];
    }
  }
};
