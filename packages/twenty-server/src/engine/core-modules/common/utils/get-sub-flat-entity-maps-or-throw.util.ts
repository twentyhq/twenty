import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';

export const getSubFlatEntityMapsOrThrow = <T extends FlatEntity>({
  flatEntityIds,
  flatEntityMaps,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityIds: string[];
}): FlatEntityMaps<T> => {
  return flatEntityIds.reduce<FlatEntityMaps<T>>((acc, flatEntityId) => {
    const flatEntity = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId,
      flatEntityMaps,
    });
    return addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity,
      flatEntityMaps: acc,
    });
  }, EMPTY_FLAT_ENTITY_MAPS);
};
