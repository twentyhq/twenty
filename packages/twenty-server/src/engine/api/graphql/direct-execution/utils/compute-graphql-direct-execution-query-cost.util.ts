import {
  type FieldNode,
  type FragmentDefinitionNode,
  Kind,
  type SelectionNode,
} from 'graphql';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

type DirectExecutionRootField = {
  field: FieldNode;
  method: WorkspaceResolverBuilderMethodNames;
  args: Record<string, unknown>;
};

export type GraphQLDirectExecutionQueryCost = {
  estimatedResultFieldCount: number;
  requestedRowCount: number;
  selectedLeafFieldCount: number;
};

type FragmentTraversalContext = {
  fieldCountByFragmentName: Map<string, number>;
  visitingFragmentNames: Set<string>;
};

const addWithMaximumSafeInteger = (left: number, right: number): number =>
  Math.min(left + right, Number.MAX_SAFE_INTEGER);

const multiplyWithMaximumSafeInteger = (left: number, right: number): number =>
  Math.min(left * right, Number.MAX_SAFE_INTEGER);

const countSelectedFields = (
  selections: readonly SelectionNode[],
  fragmentMap: Map<string, FragmentDefinitionNode>,
  fragmentTraversalContext: FragmentTraversalContext,
): number => {
  let fieldCount = 0;

  for (const selection of selections) {
    if (selection.kind === Kind.FIELD) {
      fieldCount = addWithMaximumSafeInteger(
        fieldCount,
        isDefined(selection.selectionSet)
          ? countSelectedFields(
              selection.selectionSet.selections,
              fragmentMap,
              fragmentTraversalContext,
            )
          : 1,
      );

      continue;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      fieldCount = addWithMaximumSafeInteger(
        fieldCount,
        countSelectedFields(
          selection.selectionSet.selections,
          fragmentMap,
          fragmentTraversalContext,
        ),
      );

      continue;
    }

    const fragmentName = selection.name.value;
    const cachedFieldCount =
      fragmentTraversalContext.fieldCountByFragmentName.get(fragmentName);

    if (isDefined(cachedFieldCount)) {
      fieldCount = addWithMaximumSafeInteger(fieldCount, cachedFieldCount);

      continue;
    }

    if (fragmentTraversalContext.visitingFragmentNames.has(fragmentName)) {
      continue;
    }

    const fragment = fragmentMap.get(fragmentName);

    if (!isDefined(fragment)) {
      continue;
    }

    fragmentTraversalContext.visitingFragmentNames.add(fragmentName);

    const fragmentFieldCount = countSelectedFields(
      fragment.selectionSet.selections,
      fragmentMap,
      fragmentTraversalContext,
    );

    fragmentTraversalContext.visitingFragmentNames.delete(fragmentName);
    fragmentTraversalContext.fieldCountByFragmentName.set(
      fragmentName,
      fragmentFieldCount,
    );

    fieldCount = addWithMaximumSafeInteger(fieldCount, fragmentFieldCount);
  }

  return fieldCount;
};

const getRequestedRowCount = ({
  method,
  args,
}: Pick<DirectExecutionRootField, 'method' | 'args'>): number => {
  if (method !== RESOLVER_METHOD_NAMES.FIND_MANY) {
    return 1;
  }

  const requestedRowCount = args.first ?? args.last;

  return typeof requestedRowCount === 'number'
    ? Math.max(requestedRowCount, 0)
    : QUERY_MAX_RECORDS;
};

export const computeGraphQLDirectExecutionQueryCost = ({
  rootFields,
  fragmentMap,
}: {
  rootFields: DirectExecutionRootField[];
  fragmentMap: Map<string, FragmentDefinitionNode>;
}): GraphQLDirectExecutionQueryCost => {
  const fragmentTraversalContext: FragmentTraversalContext = {
    fieldCountByFragmentName: new Map(),
    visitingFragmentNames: new Set(),
  };

  return rootFields.reduce<GraphQLDirectExecutionQueryCost>(
    (queryCost, { field, method, args }) => {
      const selectedLeafFieldCount = isDefined(field.selectionSet)
        ? countSelectedFields(
            field.selectionSet.selections,
            fragmentMap,
            fragmentTraversalContext,
          )
        : 1;
      const requestedRowCount = getRequestedRowCount({ method, args });

      return {
        estimatedResultFieldCount: addWithMaximumSafeInteger(
          queryCost.estimatedResultFieldCount,
          multiplyWithMaximumSafeInteger(
            selectedLeafFieldCount,
            requestedRowCount,
          ),
        ),
        requestedRowCount: addWithMaximumSafeInteger(
          queryCost.requestedRowCount,
          requestedRowCount,
        ),
        selectedLeafFieldCount: addWithMaximumSafeInteger(
          queryCost.selectedLeafFieldCount,
          selectedLeafFieldCount,
        ),
      };
    },
    {
      estimatedResultFieldCount: 0,
      requestedRowCount: 0,
      selectedLeafFieldCount: 0,
    },
  );
};
