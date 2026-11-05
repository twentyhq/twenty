import {
  type DocumentNode,
  getNamedType,
  type GraphQLSchema,
  isInputObjectType,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

export const normalizeWorkspaceApiGraphqlDocument = ({
  document,
  schema,
  canonicalTypeNameByApiTypeName,
  canonicalFieldNameByApiTypeNameAndApiFieldName,
}: {
  document: DocumentNode;
  schema: GraphQLSchema;
  canonicalTypeNameByApiTypeName: Readonly<Record<string, string>>;
  canonicalFieldNameByApiTypeNameAndApiFieldName: Readonly<
    Record<string, Readonly<Record<string, string>>>
  >;
}): DocumentNode => {
  const typeInfo = new TypeInfo(schema);
  const canonicalTypeNameMap = new Map(
    Object.entries(canonicalTypeNameByApiTypeName),
  );
  const canonicalFieldNameMapByApiTypeName = new Map<
    string,
    ReadonlyMap<string, string>
  >(
    Object.entries(canonicalFieldNameByApiTypeNameAndApiFieldName).map(
      ([apiTypeName, canonicalFieldNames]) => [
        apiTypeName,
        new Map(Object.entries(canonicalFieldNames)),
      ],
    ),
  );

  return visit(
    document,
    visitWithTypeInfo(typeInfo, {
      NamedType: {
        leave: (node) => {
          const canonicalTypeName = canonicalTypeNameMap.get(node.name.value);

          if (
            !isDefined(canonicalTypeName) ||
            canonicalTypeName === node.name.value
          ) {
            return;
          }

          return {
            ...node,
            name: { ...node.name, value: canonicalTypeName },
          };
        },
      },
      Field: {
        leave: (node) => {
          const parentType = typeInfo.getParentType();

          if (!isDefined(parentType)) {
            return;
          }

          const canonicalFieldName = canonicalFieldNameMapByApiTypeName
            .get(parentType.name)
            ?.get(node.name.value);

          if (
            !isDefined(canonicalFieldName) ||
            canonicalFieldName === node.name.value
          ) {
            return;
          }

          return {
            ...node,
            name: { ...node.name, value: canonicalFieldName },
          };
        },
      },
      ObjectField: {
        leave: (node) => {
          const parentInputType = getNamedType(typeInfo.getParentInputType());

          if (!isInputObjectType(parentInputType)) {
            return;
          }

          const canonicalFieldName = canonicalFieldNameMapByApiTypeName
            .get(parentInputType.name)
            ?.get(node.name.value);

          if (
            !isDefined(canonicalFieldName) ||
            canonicalFieldName === node.name.value
          ) {
            return;
          }

          return {
            ...node,
            name: { ...node.name, value: canonicalFieldName },
          };
        },
      },
    }),
  );
};
