import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isDefined } from 'twenty-shared/utils';

export const getSubFlatEntityMaps = <T extends FlatEntity>({
  flatEntityIds,
  flatEntityMaps,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityIds: string[];
}): FlatEntityMaps<T> => {
  return flatEntityIds.reduce<FlatEntityMaps<T>>((acc, flatEntityId) => {
    const flatEntity = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps,
    });

    if (!isDefined(flatEntity)) {
      return acc;
    }

    return addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity,
      flatEntityMaps: acc,
    });
  }, EMPTY_FLAT_ENTITY_MAPS);
};
