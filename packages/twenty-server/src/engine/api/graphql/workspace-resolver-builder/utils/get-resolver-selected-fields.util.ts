import {
  Kind,
  valueFromASTUntyped,
  type DirectiveNode,
  type GraphQLResolveInfo,
  type SelectionSetNode,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { type ResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/types/resolver-selected-fields.type';

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
    const responseKey = selection.alias?.value ?? fieldName;
    const selectedField: ResolverSelectedFields = (selectedFields[
      responseKey
    ] ??= {});

    if (responseKey !== fieldName) {
      selectedField.__fieldName = fieldName;
    }

    if (isDefined(selection.arguments) && selection.arguments.length > 0) {
      selectedField.__arguments = Object.fromEntries(
        selection.arguments.map((argument) => [
          argument.name.value,
          valueFromASTUntyped(argument.value, info.variableValues),
        ]),
      );
    }

    if (isDefined(selection.selectionSet)) {
      collectSelectedFields(selection.selectionSet, info, selectedField);
    }
  }
};

// Keyed by response key so aliases of one field keep their own arguments and selections
export const getResolverSelectedFields = (
  info: SelectionInfo,
): ResolverSelectedFields => {
  const selectedFields: ResolverSelectedFields = {};

  for (const fieldNode of info.fieldNodes) {
    if (isDefined(fieldNode.selectionSet)) {
      collectSelectedFields(fieldNode.selectionSet, info, selectedFields);
    }
  }

  return selectedFields;
};
