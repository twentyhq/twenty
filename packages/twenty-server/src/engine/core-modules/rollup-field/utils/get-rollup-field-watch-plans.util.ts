import { isDefined } from 'twenty-shared/utils';

import { type RollupFieldWatchPlans } from 'src/engine/core-modules/rollup-field/types/rollup-field-watch-plan.type';
import { buildRollupFieldWatchPlans } from 'src/engine/core-modules/rollup-field/utils/build-rollup-field-watch-plans.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// The cached maps keep their identity until the metadata changes, so the plans are built once per metadata version
const watchPlansByFlatFieldMetadataMaps = new WeakMap<
  FlatEntityMaps<OrmFlatFieldMetadata>,
  RollupFieldWatchPlans
>();

export const getRollupFieldWatchPlans = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMapsOrm,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMapsOrm: FlatEntityMaps<OrmFlatFieldMetadata>;
}): RollupFieldWatchPlans => {
  const memoizedWatchPlans = watchPlansByFlatFieldMetadataMaps.get(
    flatFieldMetadataMapsOrm,
  );

  if (isDefined(memoizedWatchPlans)) {
    return memoizedWatchPlans;
  }

  const watchPlans = buildRollupFieldWatchPlans({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
  });

  watchPlansByFlatFieldMetadataMaps.set(flatFieldMetadataMapsOrm, watchPlans);

  return watchPlans;
};
