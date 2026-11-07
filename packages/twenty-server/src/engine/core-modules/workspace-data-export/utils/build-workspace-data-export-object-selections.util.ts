import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { type WorkspaceDataExportObjectSelection } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-object-selection.type';
import { type FlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';

const isExportableField = (field: FlatFieldMetadata): boolean => {
  if (field.type === FieldMetadataType.TS_VECTOR) {
    return false;
  }

  if (
    isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) ||
    isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION)
  ) {
    return (
      field.settings.relationType === RelationType.MANY_TO_ONE &&
      !isMorphRelationHead(field)
    );
  }

  return true;
};

export const buildWorkspaceDataExportObjectSelections = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: Pick<FlatObjectMetadataMaps, 'byUniversalIdentifier'>;
  flatFieldMetadataMaps: FlatFieldMetadataMaps;
}): WorkspaceDataExportObjectSelection[] =>
  Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .sort((left, right) => left.nameSingular.localeCompare(right.nameSingular))
    .map((flatObjectMetadata) => {
      const fieldMetadataIds = findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: flatObjectMetadata.fieldIds,
        flatEntityMaps: flatFieldMetadataMaps,
      })
        .filter(isExportableField)
        .map((field) => field.id);

      return {
        objectMetadataId: flatObjectMetadata.id,
        nameSingular: flatObjectMetadata.nameSingular,
        labelSingular: flatObjectMetadata.labelSingular,
        fieldMetadataIds,
      };
    });
