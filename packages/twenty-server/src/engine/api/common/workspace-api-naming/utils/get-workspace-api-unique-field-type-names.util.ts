import { compositeTypeDefinitions } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceApiNamingMetadata } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-metadata.type';
import { type WorkspaceApiNamingView } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-view.type';
import { getCompositeUniqueWhereInputTypeName } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-composite-unique-where-input-type-name.util';
import { getObjectMetadataUniqueConstraints } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-object-metadata-unique-constraints.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getWorkspaceApiUniqueFieldTypeNames = ({
  flatObjectMetadata,
  fields,
  objectNameSingular,
  flatIndexMaps,
  view,
}: Pick<WorkspaceApiNamingMetadata, 'flatIndexMaps'> & {
  flatObjectMetadata: FlatObjectMetadata;
  fields: FlatFieldMetadata[];
  objectNameSingular: string;
  view: WorkspaceApiNamingView;
}): { name: string; fieldUniversalIdentifier: string }[] => {
  if (!isNonEmptyArray(flatObjectMetadata.indexMetadataIds)) {
    return [];
  }

  const uniqueConstraints = getObjectMetadataUniqueConstraints({
    flatObjectMetadata,
    fields,
    flatIndexMaps,
  });

  return uniqueConstraints.flatMap((constraint) =>
    constraint.flatMap((field) => {
      const compositeType = compositeTypeDefinitions.get(field.type);
      const hasUniqueCompositeProperty = compositeType?.properties.some(
        (property) => property.isIncludedInUniqueConstraint,
      );

      if (!isDefined(compositeType) || !hasUniqueCompositeProperty) {
        return [];
      }

      return [
        {
          name: getCompositeUniqueWhereInputTypeName({
            objectName: objectNameSingular,
            fieldName: view.fields[field.universalIdentifier] ?? field.name,
          }),
          fieldUniversalIdentifier: field.universalIdentifier,
        },
      ];
    }),
  );
};
