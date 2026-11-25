import { isDefined } from 'twenty-shared/utils';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

export const mapFlatEntities = <T extends SyncableFlatEntity>({
  flatEntityMaps,
  mapFlatEntity,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  mapFlatEntity: (flatEntity: T) => T;
}): FlatEntityMaps<T> => ({
  ...flatEntityMaps,
  byUniversalIdentifier: Object.fromEntries(
    Object.entries(flatEntityMaps.byUniversalIdentifier).map(
      ([universalIdentifier, flatEntity]) => [
        universalIdentifier,
        isDefined(flatEntity) ? mapFlatEntity(flatEntity) : flatEntity,
      ],
    ),
  ),
});
