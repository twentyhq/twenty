import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const expandMorphRelationExportFields = ({
  fields,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  fields: FlatFieldMetadata[];
  flatObjectMetadata: Pick<FlatObjectMetadata, 'fieldIds'>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): FlatFieldMetadata[] => {
  const objectFields = findManyFlatEntityByIdInFlatEntityMaps({
    flatEntityIds: flatObjectMetadata.fieldIds,
    flatEntityMaps: flatFieldMetadataMaps,
  });
  const exportedFieldIds = new Set<string>();

  return fields.flatMap((field) => {
    if (!isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION)) {
      exportedFieldIds.add(field.id);

      return [field];
    }

    return objectFields
      .filter(
        (objectField) =>
          objectField.type === FieldMetadataType.MORPH_RELATION &&
          objectField.morphId === field.morphId &&
          objectField.isActive &&
          !isMorphRelationHead(objectField) &&
          !exportedFieldIds.has(objectField.id),
      )
      .map((target) => {
        exportedFieldIds.add(target.id);

        const targetObject = isDefined(target.relationTargetObjectMetadataId)
          ? findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: target.relationTargetObjectMetadataId,
              flatEntityMaps: flatObjectMetadataMaps,
            })
          : undefined;

        return {
          ...target,
          label: isDefined(targetObject)
            ? `${field.label} / ${targetObject.labelSingular}`
            : field.label,
        };
      });
  });
};
