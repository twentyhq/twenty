import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RollupFieldComputationPlan } from 'src/engine/core-modules/rollup-field/types/rollup-field-computation-plan.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';

// A rollup whose relation or aggregated field cannot be resolved is skipped: its definition is being deleted
export const buildRollupFieldComputationPlans = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  rollupFieldMetadataIds,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  rollupFieldMetadataIds?: string[];
}): RollupFieldComputationPlan[] =>
  getFlatFieldsFromFlatObjectMetadata(flatObjectMetadata, flatFieldMetadataMaps)
    .filter((flatFieldMetadata) =>
      isFlatFieldMetadataOfType(flatFieldMetadata, FieldMetadataType.ROLLUP),
    )
    .filter(
      (rollupFlatFieldMetadata) =>
        !isDefined(rollupFieldMetadataIds) ||
        rollupFieldMetadataIds.includes(rollupFlatFieldMetadata.id),
    )
    .flatMap((rollupFlatFieldMetadata) => {
      const { relationFieldMetadataId, aggregatedFieldMetadataId } =
        rollupFlatFieldMetadata.settings;
      const relationFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });
      const childRelationFlatFieldMetadata = isDefined(
        relationFlatFieldMetadata?.relationTargetFieldMetadataId,
      )
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId:
              relationFlatFieldMetadata.relationTargetFieldMetadataId,
            flatEntityMaps: flatFieldMetadataMaps,
          })
        : undefined;
      const childFlatObjectMetadata = isDefined(
        relationFlatFieldMetadata?.relationTargetObjectMetadataId,
      )
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId:
              relationFlatFieldMetadata.relationTargetObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })
        : undefined;
      const aggregatedFlatFieldMetadata = isDefined(aggregatedFieldMetadataId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: aggregatedFieldMetadataId,
            flatEntityMaps: flatFieldMetadataMaps,
          })
        : undefined;

      if (
        !isDefined(childRelationFlatFieldMetadata) ||
        !isDefined(childFlatObjectMetadata) ||
        (isDefined(aggregatedFieldMetadataId) &&
          !isDefined(aggregatedFlatFieldMetadata))
      ) {
        return [];
      }

      return [
        {
          rollupFlatFieldMetadata,
          childFlatObjectMetadata,
          childJoinColumnName: computeMorphOrRelationFieldJoinColumnName({
            name: childRelationFlatFieldMetadata.name,
          }),
          aggregatedColumnName: aggregatedFlatFieldMetadata?.name ?? null,
        },
      ];
    });
