import { mapSchema, MapperKind } from '@graphql-tools/utils';
import { isFunction, isObject } from '@sniptt/guards';
import {
  defaultFieldResolver,
  type GraphQLSchema,
  isObjectType,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceApiNamingBindings } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-bindings.type';
import { normalizeWorkspaceApiGraphqlResolveInfo } from 'src/engine/api/common/workspace-api-naming/utils/normalize-workspace-api-graphql-resolve-info.util';
import { normalizeWorkspaceApiInputValue } from 'src/engine/api/common/workspace-api-naming/utils/normalize-workspace-api-input-value.util';
import { WorkspaceApiNamingException } from 'src/engine/api/common/workspace-api-naming/workspace-api-naming.exception';

export const createWorkspaceApiNamingSchema = ({
  apiSchema,
  canonicalSchema,
  bindings,
}: {
  apiSchema: GraphQLSchema;
  canonicalSchema: GraphQLSchema;
  bindings: WorkspaceApiNamingBindings;
}): GraphQLSchema => {
  const canonicalTypeNames = new Map(
    Object.entries(bindings.canonicalTypeNameByApiTypeName),
  );
  const canonicalFieldNamesByTypeName = new Map(
    Object.entries(bindings.canonicalFieldNameByApiTypeNameAndApiFieldName).map(
      ([typeName, fieldNames]) => [
        typeName,
        new Map(Object.entries(fieldNames)),
      ],
    ),
  );

  return mapSchema(apiSchema, {
    [MapperKind.OBJECT_FIELD]: (apiField, apiFieldName, apiTypeName) => {
      const canonicalTypeName =
        canonicalTypeNames.get(apiTypeName) ?? apiTypeName;
      const fieldNames = canonicalFieldNamesByTypeName.get(apiTypeName);
      const canonicalFieldName = fieldNames?.get(apiFieldName) ?? apiFieldName;
      const canonicalType = canonicalSchema.getType(canonicalTypeName);
      const canonicalField =
        isObjectType(canonicalType) &&
        Object.prototype.hasOwnProperty.call(
          canonicalType.getFields(),
          canonicalFieldName,
        )
          ? canonicalType.getFields()[canonicalFieldName]
          : undefined;

      if (!isDefined(canonicalField)) {
        throw new WorkspaceApiNamingException(
          `Canonical field "${canonicalTypeName}.${canonicalFieldName}" is unavailable`,
        );
      }

      const canonicalResolve = canonicalField.resolve ?? defaultFieldResolver;

      return {
        ...apiField,
        resolve: (source, args: Record<string, unknown>, context, info) => {
          let resolve = canonicalResolve;

          if (resolve === defaultFieldResolver) {
            if (!isObject(source) && !isFunction(source)) {
              return;
            }

            const property = Reflect.get(source, canonicalFieldName);

            if (!isFunction(property)) {
              return property;
            }

            resolve = (
              _source,
              canonicalArgs,
              canonicalContext,
              canonicalInfo,
            ) =>
              Reflect.apply(Reflect.get(source, canonicalFieldName), source, [
                canonicalArgs,
                canonicalContext,
                canonicalInfo,
              ]);
          }

          const canonicalArgs = Object.fromEntries(
            Object.entries(args).map(([argumentName, value]) => {
              const type = apiField.args?.[argumentName]?.type;

              return [
                argumentName,
                isDefined(type)
                  ? normalizeWorkspaceApiInputValue({
                      value,
                      type,
                      canonicalFieldNameByApiTypeNameAndApiFieldName:
                        bindings.canonicalFieldNameByApiTypeNameAndApiFieldName,
                    })
                  : value,
              ];
            }),
          );

          return resolve(
            source,
            canonicalArgs,
            context,
            normalizeWorkspaceApiGraphqlResolveInfo({
              info,
              canonicalSchema,
              canonicalFieldName,
              canonicalTypeNameByApiTypeName:
                bindings.canonicalTypeNameByApiTypeName,
              canonicalFieldNameByApiTypeNameAndApiFieldName:
                bindings.canonicalFieldNameByApiTypeNameAndApiFieldName,
            }),
          );
        },
      };
    },
  });
};
