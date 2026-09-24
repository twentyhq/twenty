import { isDefined } from 'twenty-shared/utils';

import { compareByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/compare-by-universal-identifier.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

export const sortFlatEntitiesByUniversalIdentifier = <
  TFlatEntity extends SyncableFlatEntity,
>(
  flatEntityMaps: UniversalFlatEntityMaps<TFlatEntity>,
): TFlatEntity[] =>
  Object.values(flatEntityMaps.byUniversalIdentifier)
    .filter(isDefined)
    .sort(compareByUniversalIdentifier);
