import { transformInputValue } from '@graphql-tools/utils';
import { type GraphQLInputType } from 'graphql';

export const normalizeWorkspaceApiInputValue = ({
  value,
  type,
  canonicalFieldNameByApiTypeNameAndApiFieldName,
}: {
  value: unknown;
  type: GraphQLInputType;
  canonicalFieldNameByApiTypeNameAndApiFieldName: Readonly<
    Record<string, Readonly<Record<string, string>>>
  >;
}): unknown =>
  transformInputValue(
    type,
    value,
    undefined,
    (inputType, inputValue: Record<string, unknown>) => {
      const hasTypeBindings = Object.prototype.hasOwnProperty.call(
        canonicalFieldNameByApiTypeNameAndApiFieldName,
        inputType.name,
      );
      const fieldNames: Readonly<Record<string, string>> = hasTypeBindings
        ? canonicalFieldNameByApiTypeNameAndApiFieldName[inputType.name]
        : {};

      return Object.fromEntries(
        Object.entries(inputValue).map(([fieldName, fieldValue]) => [
          Object.prototype.hasOwnProperty.call(fieldNames, fieldName)
            ? fieldNames[fieldName]
            : fieldName,
          fieldValue,
        ]),
      );
    },
  );
