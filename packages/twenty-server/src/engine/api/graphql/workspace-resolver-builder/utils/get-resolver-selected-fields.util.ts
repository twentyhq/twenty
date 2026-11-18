import { type GraphQLResolveInfo } from 'graphql';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type GraphqlFieldSelection } from 'src/engine/api/graphql/workspace-resolver-builder/types/graphql-field-selection.type';
import { type ResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/types/resolver-selected-fields.type';
import { computeSelectionKey } from 'src/engine/api/graphql/workspace-resolver-builder/utils/compute-selection-key.util';
import { getGraphqlFieldSelections } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-graphql-field-selections.util';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';

// Direct execution skips validation; such names are never schema fields and would collide with __arguments
const assertIsNotReservedFieldNameOrThrow = (fieldName: string) => {
  if (fieldName.startsWith('__') && fieldName !== '__typename') {
    throw new CommonQueryRunnerException(
      `Cannot query field "${fieldName}": names starting with "__" are reserved`,
      CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
};

const buildSelectedFields = (
  fieldSelections: GraphqlFieldSelection[],
): ResolverSelectedFields => {
  const fieldSelectionsByKey = new Map<string, GraphqlFieldSelection[]>();

  for (const fieldSelection of fieldSelections) {
    assertIsNotReservedFieldNameOrThrow(fieldSelection.fieldName);

    const selectionKey = computeSelectionKey(fieldSelection);

    fieldSelectionsByKey.set(selectionKey, [
      ...(fieldSelectionsByKey.get(selectionKey) ?? []),
      fieldSelection,
    ]);
  }

  return Object.fromEntries(
    [...fieldSelectionsByKey].map(([selectionKey, sameKeySelections]) => {
      const fieldArguments = sameKeySelections[0].arguments;

      return [
        selectionKey,
        {
          ...(Object.keys(fieldArguments).length > 0
            ? { __arguments: fieldArguments }
            : {}),
          ...buildSelectedFields(
            sameKeySelections.flatMap(({ selections }) => selections),
          ),
        },
      ];
    }),
  );
};

// Keyed by what to load, so aliases sharing a field and its arguments load once
export const getResolverSelectedFields = (
  info: Pick<GraphQLResolveInfo, 'fieldNodes' | 'fragments' | 'variableValues'>,
): ResolverSelectedFields =>
  buildSelectedFields(getGraphqlFieldSelections(info));
