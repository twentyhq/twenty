import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getSubAllFlatEntityMapsByApplicationIdsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-all-flat-entity-maps-by-application-ids-or-throw.util';

export const getApplicationSubAllFlatEntityMaps = ({
  applicationIds,
  fromAllFlatEntityMaps,
}: {
  applicationIds: string[];
  fromAllFlatEntityMaps: AllFlatEntityMaps;
}): AllFlatEntityMaps =>
  getSubAllFlatEntityMapsByApplicationIdsOrThrow({
    applicationIds,
    metadataNames: Object.values(ALL_METADATA_NAME),
    fromAllFlatEntityMaps,
  }) as AllFlatEntityMaps;
