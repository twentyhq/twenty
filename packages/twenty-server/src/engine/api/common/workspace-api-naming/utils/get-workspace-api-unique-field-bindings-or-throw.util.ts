import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceApiNamingMetadata } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-metadata.type';
import { type WorkspaceApiNamingView } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-view.type';
import { getCompositeUniqueWhereInputTypeName } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-composite-unique-where-input-type-name.util';
import { getObjectMetadataUniqueConstraints } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-object-metadata-unique-constraints.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getWorkspaceApiUniqueFieldBindingsOrThrow = ({
  flatObjectMetadata,
  apiObjectName,
  fields,
  flatIndexMaps,
  view,
}: Pick<WorkspaceApiNamingMetadata, 'flatIndexMaps'> & {
  flatObjectMetadata: FlatObjectMetadata;
  apiObjectName: string;
  fields: FlatFieldMetadata[];
  view: WorkspaceApiNamingView;
}): {
  uniqueFields: Record<string, string>;
  canonicalTypeNameByApiTypeName: Record<string, string>;
  canonicalFieldNameByApiTypeNameAndApiFieldName: Record<
    string,
    Record<string, string>
  >;
} => {
  const uniqueFields: Record<string, string> = {};
  const canonicalTypeNameByApiTypeName: Record<string, string> = {};
  const canonicalFieldNameByApiTypeNameAndApiFieldName: Record<
    string,
    Record<string, string>
  > = {};
  const uniqueConstraints = getObjectMetadataUniqueConstraints({
    flatObjectMetadata,
    fields,
    flatIndexMaps,
  });

  for (const fieldMetadata of uniqueConstraints.flat()) {
    const apiFieldName =
      view.fields[fieldMetadata.universalIdentifier] ?? fieldMetadata.name;
    const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

    if (!isDefined(compositeType)) {
      uniqueFields[apiFieldName] = fieldMetadata.name;
      continue;
    }

    const uniqueProperties = compositeType.properties.filter(
      (property) => property.isIncludedInUniqueConstraint,
    );

    if (!isNonEmptyArray(uniqueProperties)) {
      continue;
    }

    uniqueFields[apiFieldName] = fieldMetadata.name;

    const apiTypeName = getCompositeUniqueWhereInputTypeName({
      objectName: apiObjectName,
      fieldName: apiFieldName,
    });

    canonicalTypeNameByApiTypeName[apiTypeName] =
      getCompositeUniqueWhereInputTypeName({
        objectName: flatObjectMetadata.nameSingular,
        fieldName: fieldMetadata.name,
      });
    canonicalFieldNameByApiTypeNameAndApiFieldName[apiTypeName] =
      Object.fromEntries(
        uniqueProperties.map((property) => [property.name, property.name]),
      );
  }

  return {
    uniqueFields,
    canonicalTypeNameByApiTypeName,
    canonicalFieldNameByApiTypeNameAndApiFieldName,
  };
};
