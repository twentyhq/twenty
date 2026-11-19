import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getSubAllFlatEntityMapsByApplicationIdsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-all-flat-entity-maps-by-application-ids-or-throw.util';
import { restrictFieldMetadataOptionsToSliceOptionRowsThroughMutation } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/restrict-field-metadata-options-to-slice-option-rows-through-mutation.util';

export const getApplicationSubAllFlatEntityMaps = ({
  applicationIds,
  fromAllFlatEntityMaps,
}: {
  applicationIds: string[];
  fromAllFlatEntityMaps: AllFlatEntityMaps;
}): AllFlatEntityMaps => {
  const applicationSubAllFlatEntityMaps =
    getSubAllFlatEntityMapsByApplicationIdsOrThrow({
      applicationIds,
      metadataNames: Object.values(ALL_METADATA_NAME),
      fromAllFlatEntityMaps,
    });

  restrictFieldMetadataOptionsToSliceOptionRowsThroughMutation({
    allFlatEntityMapsToMutate: applicationSubAllFlatEntityMaps,
  });

  return applicationSubAllFlatEntityMaps as AllFlatEntityMaps;
};
