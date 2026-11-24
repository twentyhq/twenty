import { msg } from '@lingui/core/macro';
import {
  type DocumentNode,
  type FragmentDefinitionNode,
  type SelectionNode,
  Kind,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { graphQLBuildFragmentMap } from 'src/engine/api/graphql/utils/graphql-build-fragment-map.util';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export type GraphqlQueryComplexityLimits = {
  maximumAllowedFields?: number;
  maximumAllowedRootResolvers?: number;
  maximumAllowedNestedFields?: number;
  shouldCheckDuplicateRootResolvers?: boolean;
};

type FragmentMap = Map<string, FragmentDefinitionNode>;

type FragmentMetadata = {
  fieldsCount: number;
  depth: number;
  rootFieldNames: Set<string>;
};

type SelectionSetAnalysis = {
  fieldsCount: number;
  maxDepth: number;
  rootFieldNames: string[];
};

type DocumentAnalysis = {
  requestedFieldsCount: number;
  requestedRootResolversCount: number;
  maxNestedDepth: number;
};

export const validateGraphqlQueryComplexityOrThrow = ({
  document,
  limits: {
    maximumAllowedFields,
    maximumAllowedRootResolvers,
    maximumAllowedNestedFields,
    shouldCheckDuplicateRootResolvers = false,
  },
}: {
  document: DocumentNode;
  limits: GraphqlQueryComplexityLimits;
}): void => {
  const analysis = analyzeDocument({
    document,
    fragmentMap: graphQLBuildFragmentMap(document),
    shouldCheckDuplicateRootResolvers,
  });

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

const resolveFragmentMetadata = ({
  fragmentName,
  fragmentMap,
}: {
  fragmentName: string;
  fragmentMap: FragmentMap;
}): FragmentMetadata | undefined => {
  const fragment = fragmentMap.get(fragmentName);

  if (!isDefined(fragment)) {
    return undefined;
  }

  const metadata = analyzeSelectionSet({
    selections: fragment.selectionSet.selections,
    fragmentMap,
    currentDepth: 0,
  });

  return {
    fieldsCount: metadata.fieldsCount,
    depth: metadata.maxDepth,
    rootFieldNames: new Set(metadata.rootFieldNames),
  };
};

const analyzeSelectionSet = ({
  selections,
  fragmentMap,
  currentDepth,
}: {
  selections: readonly SelectionNode[];
  fragmentMap: FragmentMap;
  currentDepth: number;
}): SelectionSetAnalysis => {
  let fieldsCount = 0;
  let maxDepth = currentDepth;
  const rootFieldNames: string[] = [];

  for (const selection of selections) {
    switch (selection.kind) {
      case Kind.FIELD: {
        if (selection.name.value.startsWith('__')) {
          continue;
        }

        fieldsCount++;
        const fieldDepth = currentDepth + 1;

        maxDepth = Math.max(maxDepth, fieldDepth);

        if (currentDepth === 0) {
          rootFieldNames.push(selection.name.value);
        }

        if (isDefined(selection.selectionSet)) {
          const nestedResult = analyzeSelectionSet({
            selections: selection.selectionSet.selections,
            fragmentMap,
            currentDepth: fieldDepth,
          });

          fieldsCount += nestedResult.fieldsCount;
          maxDepth = Math.max(maxDepth, nestedResult.maxDepth);
        }
        break;
      }

      case Kind.INLINE_FRAGMENT: {
        const nestedResult = analyzeSelectionSet({
          selections: selection.selectionSet.selections,
          fragmentMap,
          currentDepth,
        });

        fieldsCount += nestedResult.fieldsCount;
        maxDepth = Math.max(maxDepth, nestedResult.maxDepth);
        rootFieldNames.push(...nestedResult.rootFieldNames);
        break;
      }

      case Kind.FRAGMENT_SPREAD: {
        const metadata = resolveFragmentMetadata({
          fragmentName: selection.name.value,
          fragmentMap,
        });

        if (isDefined(metadata)) {
          fieldsCount += metadata.fieldsCount;
          maxDepth = Math.max(maxDepth, currentDepth + metadata.depth);

          if (currentDepth === 0) {
            rootFieldNames.push(...metadata.rootFieldNames);
          }
        }
        break;
      }
    }
  }

  return { fieldsCount, maxDepth, rootFieldNames };
};

const analyzeDocument = ({
  document,
  fragmentMap,
  shouldCheckDuplicateRootResolvers,
}: {
  document: DocumentNode;
  fragmentMap: FragmentMap;
  shouldCheckDuplicateRootResolvers: boolean;
}): DocumentAnalysis => {
  let requestedFieldsCount = 0;
  let requestedRootResolversCount = 0;
  let maxNestedDepth = 0;
  const rootResolverNames = new Set<string>();

  for (const definition of document.definitions) {
    if (definition.kind !== Kind.OPERATION_DEFINITION) {
      continue;
    }

    const result = analyzeSelectionSet({
      selections: definition.selectionSet.selections,
      fragmentMap,
      currentDepth: 0,
    });

    requestedFieldsCount += result.fieldsCount;
    maxNestedDepth = Math.max(maxNestedDepth, result.maxDepth);

    for (const name of result.rootFieldNames) {
      requestedRootResolversCount++;

      if (shouldCheckDuplicateRootResolvers && rootResolverNames.has(name)) {
        throw new UserInputError(`Duplicate root resolver: "${name}"`, {
          userFriendlyMessage: msg`Duplicate root resolver found. Each root resolver can only be called once per document.`,
        });
      }

      rootResolverNames.add(name);
    }
  }

  return { requestedFieldsCount, requestedRootResolversCount, maxNestedDepth };
};
