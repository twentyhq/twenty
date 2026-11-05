import { getFieldMetadataGqlEnumTypeName } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-field-metadata-gql-enum-type-name.util';
import { getGqlEnumFilterTypeName } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-gql-enum-filter-type-name.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const getWorkspaceApiFieldTypeNames = ({
  objectNameSingular,
  flatFieldMetadata,
  name,
}: {
  objectNameSingular: string;
  flatFieldMetadata: FlatFieldMetadata;
  name: string;
}): string[] => {
  if (!isEnumFieldMetadataType(flatFieldMetadata.type)) {
    return [];
  }

  const enumTypeName = getFieldMetadataGqlEnumTypeName({
    objectName: objectNameSingular,
    fieldName: name,
  });

  return [enumTypeName, getGqlEnumFilterTypeName(enumTypeName)];
};
