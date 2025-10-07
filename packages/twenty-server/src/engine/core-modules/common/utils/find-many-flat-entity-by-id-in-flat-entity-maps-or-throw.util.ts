import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/get-sub-flat-entity-maps-or-throw.util';

export type FindManyFlatEntityByIdInFlatEntityMapsOrThrowArgs<
  T extends FlatEntity,
> = {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityIds: string[];
};
export const findManyFlatEntityByIdInFlatEntityMapsOrThrow = <
  T extends FlatEntity,
>({
  flatEntityMaps,
  flatEntityIds,
}: FindManyFlatEntityByIdInFlatEntityMapsOrThrowArgs<T>): T[] => {
  const subFlatEntityMaps = getSubFlatEntityMapsOrThrow<T>({
    flatEntityIds,
    flatEntityMaps,
  });

  return Object.values(subFlatEntityMaps.byId).filter(isDefined);
};
