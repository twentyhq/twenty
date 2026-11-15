import { RelationType } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import { getRelationSelectionEntries } from 'src/engine/api/common/utils/get-relation-selection-entries.util';
import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const computeMaxFieldCountPerRecord = ({
  selectedFieldsResult: { select, relationSelections },
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  recordLimitPerOneToManyRelation,
}: {
  selectedFieldsResult: Pick<
    CommonSelectedFieldsResult,
    'select' | 'relationSelections'
  >;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  recordLimitPerOneToManyRelation: number;
}): number => {
  const relationEntries = getRelationSelectionEntries(relationSelections);

  return relationEntries.reduce(
    (fieldCount, { responseKey, relationSelection }) => {
      const relationField = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: buildFieldMapsFromFlatObjectMetadata(
          flatFieldMetadataMaps,
          flatObjectMetadata,
        ).fieldIdByName[relationSelection.fieldName],
        flatEntityMaps: flatFieldMetadataMaps,
      });
      const relationSelect = select[responseKey];

      if (
        !isMorphOrRelationFlatFieldMetadata(relationField) ||
        !isPlainObject(relationSelect)
      ) {
        return fieldCount;
      }

      return (
        fieldCount +
        (relationField.settings.relationType === RelationType.ONE_TO_MANY
          ? recordLimitPerOneToManyRelation
          : 1) *
          computeMaxFieldCountPerRecord({
            selectedFieldsResult: {
              select: relationSelect,
              relationSelections: relationSelection.relationSelections,
            },
            flatObjectMetadata: findFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityId: relationField.relationTargetObjectMetadataId,
              flatEntityMaps: flatObjectMetadataMaps,
            }),
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            recordLimitPerOneToManyRelation,
          })
      );
    },
    Object.keys(select).length - relationEntries.length,
  );
};
