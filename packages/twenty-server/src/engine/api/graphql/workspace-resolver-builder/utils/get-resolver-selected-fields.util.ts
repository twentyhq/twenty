import {
  Kind,
  valueFromASTUntyped,
  type DirectiveNode,
  type GraphQLResolveInfo,
  type SelectionSetNode,
} from 'graphql';
import isEqual from 'lodash.isequal';
import { isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { extractArgumentsFromAst } from 'src/engine/api/graphql/direct-execution/utils/extract-arguments-from-ast.util';
import { type ResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/types/resolver-selected-fields.type';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';

type SelectionInfo = Pick<
  GraphQLResolveInfo,
  'fieldNodes' | 'fragments' | 'variableValues'
>;

const isSelectionIncluded = (
  directives: readonly DirectiveNode[] | undefined,
  variableValues: SelectionInfo['variableValues'],
) =>
  (directives ?? []).every((directive) => {
    const condition = directive.arguments?.find(
      (argument) => argument.name.value === 'if',
    );

    if (!isDefined(condition)) {
      return true;
    }

    const conditionValue = valueFromASTUntyped(condition.value, variableValues);

    if (directive.name.value === 'skip') {
      return conditionValue !== true;
    }

    return directive.name.value !== 'include' || conditionValue !== false;
  });

const collectSelectedFields = (
  selectionSet: SelectionSetNode,
  info: SelectionInfo,
  selectedFields: ResolverSelectedFields,
) => {
  for (const selection of selectionSet.selections) {
    if (!isSelectionIncluded(selection.directives, info.variableValues)) {
      continue;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      collectSelectedFields(selection.selectionSet, info, selectedFields);
      continue;
    }

    if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = info.fragments[selection.name.value];

      if (isDefined(fragment)) {
        collectSelectedFields(fragment.selectionSet, info, selectedFields);
      }
      continue;
    }

    const fieldName = selection.name.value;
    const isAlreadySelected = isDefined(selectedFields[fieldName]);
    const selectedField: ResolverSelectedFields = (selectedFields[fieldName] ??=
      Object.create(null));

    const fieldArguments = extractArgumentsFromAst(
      selection.arguments,
      info.variableValues,
    );

    // Selections are keyed by field name, so aliases of one field share a single set of arguments
    if (
      isAlreadySelected &&
      !isEqual(selectedField.__arguments ?? {}, fieldArguments)
    ) {
      throw new CommonQueryRunnerException(
        `Conflicting arguments for "${fieldName}": every selection of a field must use the same arguments`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    if (Object.keys(fieldArguments).length > 0) {
      selectedField.__arguments = fieldArguments;
    }

    if (isDefined(selection.selectionSet)) {
      collectSelectedFields(selection.selectionSet, info, selectedField);
    }
  }
};

// Null-prototype levels: a selected name such as __proto__ must stay an ordinary key
export const getResolverSelectedFields = (
  info: SelectionInfo,
): ResolverSelectedFields => {
  const selectedFields: ResolverSelectedFields = Object.create(null);

  for (const fieldNode of info.fieldNodes) {
    if (isDefined(fieldNode.selectionSet)) {
      collectSelectedFields(fieldNode.selectionSet, info, selectedFields);
    }
  }

  return selectedFields;
};
