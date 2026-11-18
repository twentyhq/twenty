import { type GraphQLResolveInfo } from 'graphql';
import isEqual from 'lodash.isequal';
import { isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type GraphqlFieldSelection } from 'src/engine/api/graphql/workspace-resolver-builder/types/graphql-field-selection.type';
import { type ResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/types/resolver-selected-fields.type';
import { getGraphqlFieldSelections } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-graphql-field-selections.util';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';

const addFieldSelections = (
  fieldSelections: GraphqlFieldSelection[],
  selectedFields: ResolverSelectedFields,
) => {
  for (const fieldSelection of fieldSelections) {
    const { fieldName } = fieldSelection;
    const existingSelectedField: ResolverSelectedFields | undefined =
      selectedFields[fieldName];

    // Keyed by field name, so aliases of one field share a single set of arguments
    if (
      isDefined(existingSelectedField) &&
      !isEqual(
        existingSelectedField.__arguments ?? {},
        fieldSelection.arguments,
      )
    ) {
      throw new CommonQueryRunnerException(
        `Conflicting arguments for "${fieldName}": every selection of a field must use the same arguments`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const selectedField: ResolverSelectedFields =
      existingSelectedField ?? Object.create(null);

    selectedFields[fieldName] = selectedField;

    if (Object.keys(fieldSelection.arguments).length > 0) {
      selectedField.__arguments = fieldSelection.arguments;
    }

    addFieldSelections(fieldSelection.selections, selectedField);
  }
};

// Null-prototype levels: a selected name such as __proto__ must stay an ordinary key
export const getResolverSelectedFields = (
  info: Pick<GraphQLResolveInfo, 'fieldNodes' | 'fragments' | 'variableValues'>,
): ResolverSelectedFields => {
  const selectedFields: ResolverSelectedFields = Object.create(null);

  addFieldSelections(getGraphqlFieldSelections(info), selectedFields);

  return selectedFields;
};
