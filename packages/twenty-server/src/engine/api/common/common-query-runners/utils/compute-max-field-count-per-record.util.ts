import { RelationType } from 'twenty-shared/types';

import { getRelationSelectionEntries } from 'src/engine/api/common/utils/get-relation-selection-entries.util';
import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const computeMaxFieldCountPerRecord = ({
  selection,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  recordLimitPerOneToManyRelation,
}: {
  selection: Pick<CommonSelection, 'columns' | 'relations'>;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  recordLimitPerOneToManyRelation: number;
}): number =>
  getRelationSelectionEntries(selection).reduce(
    (fieldCount, { relationSelection }) => {
      const relationField = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: buildFieldMapsFromFlatObjectMetadata(
          flatFieldMetadataMaps,
          flatObjectMetadata,
        ).fieldIdByName[relationSelection.fieldName],
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isMorphOrRelationFlatFieldMetadata(relationField)) {
        return fieldCount;
      }

      return (
        fieldCount +
        (relationField.settings.relationType === RelationType.ONE_TO_MANY
          ? recordLimitPerOneToManyRelation
          : 1) *
          computeMaxFieldCountPerRecord({
            selection: relationSelection.selection,
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
    Object.keys(selection.columns).length,
  );
