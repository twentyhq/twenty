import { isDefined } from 'twenty-shared/utils';

import { type RollupFieldWatchPlans } from 'src/engine/core-modules/rollup-field/types/rollup-field-watch-plan.type';
import { buildRollupFieldComputationPlans } from 'src/engine/core-modules/rollup-field/utils/build-rollup-field-computation-plans.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { findRollupFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-rollup-flat-field-metadatas.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildRollupFieldWatchPlans = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): RollupFieldWatchPlans => {
  const objectMetadataIdsWithRollups = [
    ...new Set(
      findRollupFlatFieldMetadatas(flatFieldMetadataMaps).map(
        ({ objectMetadataId }) => objectMetadataId,
      ),
    ),
  ];
  const watchPlansByChildObjectMetadataId: RollupFieldWatchPlans['watchPlansByChildObjectMetadataId'] =
    {};

  for (const objectMetadataId of objectMetadataIdsWithRollups) {
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      continue;
    }

    for (const {
      rollupFlatFieldMetadata,
      childFlatObjectMetadata,
      childJoinColumnName,
      aggregatedColumnName,
    } of buildRollupFieldComputationPlans({
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    })) {
      const filterFieldNames = findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: rollupFlatFieldMetadata.settings.filters.map(
          ({ fieldMetadataId }) => fieldMetadataId,
        ),
        flatEntityMaps: flatFieldMetadataMaps,
      }).map(({ name }) => name);

      watchPlansByChildObjectMetadataId[childFlatObjectMetadata.id] = [
        ...(watchPlansByChildObjectMetadataId[childFlatObjectMetadata.id] ??
          []),
        {
          parentObjectMetadataId: objectMetadataId,
          childJoinColumnName,
          watchedFieldNames: [
            childJoinColumnName,
            aggregatedColumnName,
            ...filterFieldNames,
          ].filter(isDefined),
        },
      ];
    }
  }

  return { watchPlansByChildObjectMetadataId, objectMetadataIdsWithRollups };
};
