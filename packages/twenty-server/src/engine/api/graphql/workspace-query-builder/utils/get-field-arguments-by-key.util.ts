import {
  Kind,
  type FieldNode,
  type GraphQLResolveInfo,
  type InlineFragmentNode,
  type SelectionNode,
  type SelectionSetNode,
  type ValueNode,
} from 'graphql';

const isFieldNode = (node: SelectionNode): node is FieldNode =>
  node.kind === Kind.FIELD;

const isInlineFragmentNode = (
  node: SelectionNode,
): node is InlineFragmentNode => node.kind === Kind.INLINE_FRAGMENT;

const findFieldNode = (
  selectionSet: SelectionSetNode | undefined,
  key: string,
): FieldNode | null => {
  if (!selectionSet) return null;

  let field: FieldNode | null = null;

  for (const selection of selectionSet.selections) {
    // We've found the field
    if (isFieldNode(selection) && selection.name.value === key) {
      return selection;
    }

    // Recursively search for the field in nested selections
    if (
      (isFieldNode(selection) || isInlineFragmentNode(selection)) &&
      selection.selectionSet
    ) {
      field = findFieldNode(selection.selectionSet, key);

      // If we find the field in a nested selection, stop searching
      if (field) break;
    }
  }

  return field;
};

// @ts-expect-error legacy noImplicitAny
const parseValueNode = (
  valueNode: ValueNode,
  variables: GraphQLResolveInfo['variableValues'],
) => {
  switch (valueNode.kind) {
    case Kind.VARIABLE:
      return variables[valueNode.name.value];
    case Kind.INT:
    case Kind.FLOAT:
      return Number(valueNode.value);
    case Kind.STRING:
    case Kind.BOOLEAN:
    case Kind.ENUM:
      return valueNode.value;
    case Kind.LIST:
      // @ts-expect-error legacy noImplicitAny
      return valueNode.values.map((value) => parseValueNode(value, variables));
    case Kind.OBJECT:
      return valueNode.fields.reduce((obj, field) => {
        // @ts-expect-error legacy noImplicitAny
        obj[field.name.value] = parseValueNode(field.value, variables);

        return obj;
      }, {});
    default:
      return null;
  }
};

export const getFieldArgumentsByKey = (
  info: GraphQLResolveInfo,
  fieldKey: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> => {
  // Start from the first top-level field node and search recursively
  const targetField = findFieldNode(info.fieldNodes[0].selectionSet, fieldKey);

  // If the field is not found, throw an error
  if (!targetField) {
    throw new Error(`Field "${fieldKey}" not found.`);
  }

  // Extract the arguments from the field we've found
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const args: Record<string, any> = {};

  if (targetField.arguments && targetField.arguments.length) {
    for (const arg of targetField.arguments) {
      args[arg.name.value] = parseValueNode(arg.value, info.variableValues);
    }
  }

  return args;
};
