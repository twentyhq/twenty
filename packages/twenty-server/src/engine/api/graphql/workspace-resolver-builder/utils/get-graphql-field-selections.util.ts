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
import { type GraphqlFieldSelection } from 'src/engine/api/graphql/workspace-resolver-builder/types/graphql-field-selection.type';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';

type SelectionInfo = Pick<
  GraphQLResolveInfo,
  'fieldNodes' | 'fragments' | 'variableValues'
>;

type FieldSelectionsByResponseKey = Map<
  string,
  Omit<GraphqlFieldSelection, 'selections'> & {
    selectionsByResponseKey: FieldSelectionsByResponseKey;
  }
>;

const isSelectionIncluded = ({
  directives,
  variableValues,
}: {
  directives: readonly DirectiveNode[] | undefined;
  variableValues: SelectionInfo['variableValues'];
}) =>
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

const collectFieldSelectionsOrThrow = ({
  selectionSet,
  info,
  selectionsByResponseKey,
}: {
  selectionSet: SelectionSetNode;
  info: SelectionInfo;
  selectionsByResponseKey: FieldSelectionsByResponseKey;
}) => {
  for (const selection of selectionSet.selections) {
    if (
      !isSelectionIncluded({
        directives: selection.directives,
        variableValues: info.variableValues,
      })
    ) {
      continue;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      collectFieldSelectionsOrThrow({
        selectionSet: selection.selectionSet,
        info,
        selectionsByResponseKey: selectionsByResponseKey,
      });
      continue;
    }

    if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = info.fragments[selection.name.value];

      if (!isDefined(fragment)) {
        throw new CommonQueryRunnerException(
          `Unknown fragment "${selection.name.value}"`,
          CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      collectFieldSelectionsOrThrow({
        selectionSet: fragment.selectionSet,
        info,
        selectionsByResponseKey: selectionsByResponseKey,
      });
      continue;
    }

    const fieldName = selection.name.value;
    const responseKey = selection.alias?.value ?? fieldName;
    const fieldArguments = extractArgumentsFromAst(
      selection.arguments,
      info.variableValues,
    );
    const existingSelection = selectionsByResponseKey.get(responseKey);

    // Direct execution skips GraphQL validation, so its field-merging rule is enforced here
    if (
      isDefined(existingSelection) &&
      (existingSelection.fieldName !== fieldName ||
        !isEqual(existingSelection.arguments, fieldArguments))
    ) {
      throw new CommonQueryRunnerException(
        `Fields "${responseKey}" conflict: selections sharing a response key must request the same field with the same arguments`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const fieldSelection = existingSelection ?? {
      responseKey,
      fieldName,
      arguments: fieldArguments,
      selectionsByResponseKey: new Map(),
    };

    selectionsByResponseKey.set(responseKey, fieldSelection);

    if (isDefined(selection.selectionSet)) {
      collectFieldSelectionsOrThrow({
        selectionSet: selection.selectionSet,
        info,
        selectionsByResponseKey: fieldSelection.selectionsByResponseKey,
      });
    }
  }
};

const toFieldSelections = (
  selectionsByResponseKey: FieldSelectionsByResponseKey,
): GraphqlFieldSelection[] =>
  [...selectionsByResponseKey.values()].map(
    ({ selectionsByResponseKey: childSelections, ...fieldSelection }) => ({
      ...fieldSelection,
      selections: toFieldSelections(childSelections),
    }),
  );

export const getGraphqlFieldSelections = (
  info: SelectionInfo,
): GraphqlFieldSelection[] => {
  const selectionsByResponseKey: FieldSelectionsByResponseKey = new Map();

  for (const fieldNode of info.fieldNodes) {
    if (isDefined(fieldNode.selectionSet)) {
      collectFieldSelectionsOrThrow({
        selectionSet: fieldNode.selectionSet,
        info,
        selectionsByResponseKey: selectionsByResponseKey,
      });
    }
  }

  return toFieldSelections(selectionsByResponseKey);
};
