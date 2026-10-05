import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const computeMaxFieldCountPerRecord = ({
  select,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  recordLimitPerOneToManyRelation,
}: {
  select: CommonSelectedFields;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  recordLimitPerOneToManyRelation: number;
}): number => {
  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    flatObjectMetadata,
  );

  const maxFieldCount = Object.entries(select).reduce(
    (fieldCount, [fieldName, selectedValue]) => {
      if (typeof selectedValue !== 'object') {
        return fieldCount + 1;
      }

      const relationField = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldIdByName[fieldName],
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (
        !isDefined(relationField) ||
        !isMorphOrRelationFlatFieldMetadata(relationField)
      ) {
        return fieldCount;
      }

      const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationField.relationTargetObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(targetObjectMetadata)) {
        return fieldCount;
      }

      const relatedRecordCountPerRecord =
        relationField.settings?.relationType === RelationType.ONE_TO_MANY
          ? recordLimitPerOneToManyRelation
          : 1;

      return (
        fieldCount +
        relatedRecordCountPerRecord *
          computeMaxFieldCountPerRecord({
            select: selectedValue,
            flatObjectMetadata: targetObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            recordLimitPerOneToManyRelation,
          })
      );
    },
    0,
  );

  return Math.max(maxFieldCount, 1);
};
