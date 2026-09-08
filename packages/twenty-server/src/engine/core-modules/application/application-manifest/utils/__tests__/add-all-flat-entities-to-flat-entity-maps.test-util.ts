import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';

export const addAllFlatEntitiesToFlatEntityMaps = <
  TFlatEntity extends SyncableFlatEntity,
>({
  flatEntities,
  flatEntityMaps,
}: {
  flatEntities: TFlatEntity[];
  flatEntityMaps: FlatEntityMaps<TFlatEntity>;
}): FlatEntityMaps<TFlatEntity> =>
  flatEntities.reduce(
    (maps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity,
        flatEntityMaps: maps,
      }),
    flatEntityMaps,
  );
