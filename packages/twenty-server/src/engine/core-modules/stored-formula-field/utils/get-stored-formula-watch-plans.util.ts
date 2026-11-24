import { isDefined } from 'twenty-shared/utils';

import { type StoredFormulaWatchPlans } from 'src/engine/core-modules/stored-formula-field/types/stored-formula-watch-plans.type';
import { buildStoredFormulaWatchPlans } from 'src/engine/core-modules/stored-formula-field/utils/build-stored-formula-watch-plans.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// The cached maps keep their identity until the metadata changes, so the plans are built once per metadata version
const storedFormulaWatchPlansByFlatFieldMetadataMaps = new WeakMap<
  FlatEntityMaps<OrmFlatFieldMetadata>,
  StoredFormulaWatchPlans
>();

export const getStoredFormulaWatchPlans = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMapsOrm,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMapsOrm: FlatEntityMaps<OrmFlatFieldMetadata>;
}): StoredFormulaWatchPlans => {
  const memoizedWatchPlans = storedFormulaWatchPlansByFlatFieldMetadataMaps.get(
    flatFieldMetadataMapsOrm,
  );

  if (isDefined(memoizedWatchPlans)) {
    return memoizedWatchPlans;
  }

  const watchPlans = buildStoredFormulaWatchPlans({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
  });

  storedFormulaWatchPlansByFlatFieldMetadataMaps.set(
    flatFieldMetadataMapsOrm,
    watchPlans,
  );

  return watchPlans;
};
