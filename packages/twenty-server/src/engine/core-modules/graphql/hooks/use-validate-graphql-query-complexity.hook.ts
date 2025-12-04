import { msg } from '@lingui/core/macro';
import {
  type DocumentNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type SelectionNode,
  Kind,
} from 'graphql';
import { type Plugin } from 'graphql-yoga';
import { isDefined } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

type FragmentMetadata = {
  fieldsCount: number;
  depth: number;
  rootFieldNames: Set<string>;
};

type AnalysisResult = {
  requestedFieldsCount: number;
  requestedRootResolversCount: number;
  maxNestedDepth: number;
  rootResolverNames: string[];
};

export const useValidateGraphqlQueryComplexity = ({
  maximumAllowedFields,
  maximumAllowedRootResolvers,
  maximumAllowedNestedFields,
  checkDuplicateRootResolvers = false,
}: {
  maximumAllowedFields?: number;
  maximumAllowedRootResolvers?: number;
  maximumAllowedNestedFields?: number;
  checkDuplicateRootResolvers?: boolean;
}): Plugin => ({
  onParse: () => {
    return ({ result }) => {
      if (!result || !('kind' in result) || result.kind !== Kind.DOCUMENT) {
        return;
      }

      const document = result as DocumentNode;
      const fragmentMap = buildFragmentMap(document);

      const analysis = analyzeDocument(
        document,
        fragmentMap,
        checkDuplicateRootResolvers,
      );

      if (
        isDefined(maximumAllowedNestedFields) &&
        analysis.maxNestedDepth > maximumAllowedNestedFields
      ) {
        throw new UserInputError(
          `Query too complex - Too many nested fields requested: ${analysis.maxNestedDepth} - Maximum allowed nested fields: ${maximumAllowedNestedFields}`,
        );
      }

      if (
        isDefined(maximumAllowedFields) &&
        analysis.requestedFieldsCount > maximumAllowedFields
      ) {
        throw new UserInputError(
          `Query too complex - Too many fields requested: ${analysis.requestedFieldsCount} - Maximum allowed fields: ${maximumAllowedFields}`,
          {
            userFriendlyMessage: msg`The request is too complex to process. Please try reducing the amount of requested fields.`,
          },
        );
      }

      if (
        isDefined(maximumAllowedRootResolvers) &&
        analysis.requestedRootResolversCount > maximumAllowedRootResolvers
      ) {
        throw new UserInputError(
          `Query too complex - Too many root resolvers requested: ${analysis.requestedRootResolversCount} - Maximum allowed root resolvers: ${maximumAllowedRootResolvers}`,
          {
            userFriendlyMessage: msg`The request is too complex to process. Please try reducing the amount of requested root resolvers.`,
          },
        );
      }
    };
  },
});

const buildFragmentMap = (
  document: DocumentNode,
): Map<string, FragmentDefinitionNode> => {
  const fragmentMap = new Map<string, FragmentDefinitionNode>();

  for (const definition of document.definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      fragmentMap.set(definition.name.value, definition);
    }
  }

  return fragmentMap;
};

const resolveFragmentMetadata = (
  fragmentName: string,
  fragmentMap: Map<string, FragmentDefinitionNode>,
): FragmentMetadata | undefined => {
  const fragment = fragmentMap.get(fragmentName);

  if (!isDefined(fragment)) {
    return undefined;
  }

  const metadata = analyzeSelectionSet(
    fragment.selectionSet.selections,
    fragmentMap,
    0,
  );

  const result: FragmentMetadata = {
    fieldsCount: metadata.fieldsCount,
    depth: metadata.maxDepth,
    rootFieldNames: new Set(metadata.rootFieldNames),
  };

  return result;
};

const analyzeSelectionSet = (
  selections: readonly SelectionNode[],
  fragmentMap: Map<string, FragmentDefinitionNode>,
  currentDepth: number,
): {
  fieldsCount: number;
  maxDepth: number;
  rootFieldNames: string[];
} => {
  let fieldsCount = 0;
  let maxDepth = currentDepth;
  const rootFieldNames: string[] = [];

  for (const selection of selections) {
    switch (selection.kind) {
      case Kind.FIELD: {
        const fieldNode = selection as FieldNode;

        // Skip introspection fields
        if (fieldNode.name.value.startsWith('__')) {
          continue;
        }

        fieldsCount++;
        const fieldDepth = currentDepth + 1;

        maxDepth = Math.max(maxDepth, fieldDepth);

        if (currentDepth === 0) {
          rootFieldNames.push(fieldNode.name.value);
        }

        if (fieldNode.selectionSet) {
          const nestedResult = analyzeSelectionSet(
            fieldNode.selectionSet.selections,
            fragmentMap,
            fieldDepth,
          );

          fieldsCount += nestedResult.fieldsCount;
          maxDepth = Math.max(maxDepth, nestedResult.maxDepth);
        }
        break;
      }

      case Kind.INLINE_FRAGMENT: {
        if (selection.selectionSet) {
          const nestedResult = analyzeSelectionSet(
            selection.selectionSet.selections,
            fragmentMap,
            currentDepth,
          );

          fieldsCount += nestedResult.fieldsCount;
          maxDepth = Math.max(maxDepth, nestedResult.maxDepth);

          for (const name of nestedResult.rootFieldNames) {
            rootFieldNames.push(name);
          }
        }
        break;
      }

      case Kind.FRAGMENT_SPREAD: {
        const fragmentName = selection.name.value;
        const metadata = resolveFragmentMetadata(fragmentName, fragmentMap);

        if (isDefined(metadata)) {
          fieldsCount += metadata.fieldsCount;
          maxDepth = Math.max(maxDepth, currentDepth + metadata.depth);

          if (currentDepth === 0) {
            for (const name of metadata.rootFieldNames) {
              rootFieldNames.push(name);
            }
          }
        }
        break;
      }
    }
  }

  return { fieldsCount, maxDepth, rootFieldNames };
};

const analyzeDocument = (
  document: DocumentNode,
  fragmentMap: Map<string, FragmentDefinitionNode>,
  checkDuplicateRootResolvers: boolean,
): AnalysisResult => {
  let requestedFieldsCount = 0;
  let requestedRootResolversCount = 0;
  let maxNestedDepth = 0;
  const rootResolverNames: string[] = [];

  for (const definition of document.definitions) {
    if (
      definition.kind === Kind.OPERATION_DEFINITION &&
      definition.selectionSet
    ) {
      const result = analyzeSelectionSet(
        definition.selectionSet.selections,
        fragmentMap,
        0,
      );

      requestedFieldsCount += result.fieldsCount;
      maxNestedDepth = Math.max(maxNestedDepth, result.maxDepth);

      for (const name of result.rootFieldNames) {
        requestedRootResolversCount++;
        if (checkDuplicateRootResolvers && rootResolverNames.includes(name)) {
          throw new UserInputError(`Duplicate root resolver: "${name}"`, {
            userFriendlyMessage: msg`Duplicate root resolver found. Each root resolver can only be called once per document.`,
          });
        }
        rootResolverNames.push(name);
      }
    }
  }

  return {
    requestedFieldsCount,
    requestedRootResolversCount,
    maxNestedDepth,
    rootResolverNames,
  };
};
