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

const countSelectedFields = (
  selections: readonly SelectionNode[],
  fragmentMap: Map<string, FragmentDefinitionNode>,
  visitedFragmentNames: ReadonlySet<string> = new Set(),
): number => {
  let fieldCount = 0;

  for (const selection of selections) {
    if (selection.kind === Kind.FIELD) {
      fieldCount += isDefined(selection.selectionSet)
        ? countSelectedFields(
            selection.selectionSet.selections,
            fragmentMap,
            visitedFragmentNames,
          )
        : 1;

      continue;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      fieldCount += countSelectedFields(
        selection.selectionSet.selections,
        fragmentMap,
        visitedFragmentNames,
      );

      continue;
    }

    const fragmentName = selection.name.value;

    if (visitedFragmentNames.has(fragmentName)) {
      continue;
    }

    const fragment = fragmentMap.get(fragmentName);

    if (!isDefined(fragment)) {
      continue;
    }

    fieldCount += countSelectedFields(
      fragment.selectionSet.selections,
      fragmentMap,
      new Set([...visitedFragmentNames, fragmentName]),
    );
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
}): GraphQLDirectExecutionQueryCost =>
  rootFields.reduce<GraphQLDirectExecutionQueryCost>(
    (queryCost, { field, method, args }) => {
      const selectedLeafFieldCount = isDefined(field.selectionSet)
        ? countSelectedFields(field.selectionSet.selections, fragmentMap)
        : 1;
      const requestedRowCount = getRequestedRowCount({ method, args });

      return {
        estimatedResultFieldCount:
          queryCost.estimatedResultFieldCount +
          selectedLeafFieldCount * requestedRowCount,
        requestedRowCount: queryCost.requestedRowCount + requestedRowCount,
        selectedLeafFieldCount:
          queryCost.selectedLeafFieldCount + selectedLeafFieldCount,
      };
    },
    {
      estimatedResultFieldCount: 0,
      requestedRowCount: 0,
      selectedLeafFieldCount: 0,
    },
  );
