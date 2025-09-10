import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';

export type ReplaceFlatEntityInFlatEntityMapsOrThrowArgs<T extends FlatEntity> =
  {
    flatEntity: T;
    flatEntityMaps: FlatEntityMaps<T>;
  };

export const replaceFlatEntityInFlatEntityMapsOrThrow = <T extends FlatEntity>({
  flatEntity,
  flatEntityMaps,
}: ReplaceFlatEntityInFlatEntityMapsOrThrowArgs<T>): FlatEntityMaps<T> => {
  const flatEntityMapsToReplace = deleteFlatEntityFromFlatEntityMapsOrThrow({
    flatEntityMaps,
    entityToDeleteId: flatEntity.id,
  });

  return addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity,
    flatEntityMaps: flatEntityMapsToReplace,
  });
};
