import { isDefined } from 'class-validator';

import {
  FlatEntityException,
  FlatEntityExceptionCode,
} from 'src/engine/core-modules/common/exceptions/flat-entity.exception';
import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';

type AddFlatEntityToFlatEntityMapsOrThrowArgs<T extends FlatEntity> = {
  flatEntity: T;
  flatEntityMaps: FlatEntityMaps<T>;
};

export const addFlatEntityToFlatEntityMapsOrThrow = <T extends FlatEntity>({
  flatEntity,
  flatEntityMaps,
}: AddFlatEntityToFlatEntityMapsOrThrowArgs<T>): FlatEntityMaps<T> => {
  if (isDefined(flatEntityMaps.byId[flatEntity.id])) {
    throw new FlatEntityException(
      'addFlatEntityToFlatEntityMapsOrThrow: flat entity to add already exists',
      FlatEntityExceptionCode.ENTITY_ALREADY_EXISTS,
    );
  }

  return {
    byId: {
      ...flatEntityMaps.byId,
      [flatEntity.id]: flatEntity,
    },
    idByUniversalIdentifier: {
      ...flatEntityMaps.idByUniversalIdentifier,
      [flatEntity.universalIdentifier]: flatEntity.id,
    },
  };
};
