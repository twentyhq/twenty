import { isDefined } from 'twenty-shared/utils';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

export const transformEachFlatEntityInFlatEntityMaps = <
  TFlatEntity extends SyncableFlatEntity,
>({
  flatEntityMaps,
  transformFlatEntity,
}: {
  flatEntityMaps: FlatEntityMaps<TFlatEntity>;
  transformFlatEntity: (flatEntity: TFlatEntity) => TFlatEntity;
}): FlatEntityMaps<TFlatEntity> => ({
  ...flatEntityMaps,
  byUniversalIdentifier: Object.fromEntries(
    Object.entries(flatEntityMaps.byUniversalIdentifier).map(
      ([universalIdentifier, flatEntity]) => [
        universalIdentifier,
        isDefined(flatEntity) ? transformFlatEntity(flatEntity) : flatEntity,
      ],
    ),
  ),
});
