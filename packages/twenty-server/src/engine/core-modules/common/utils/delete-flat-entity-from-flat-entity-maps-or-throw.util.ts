import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/core-modules/common/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';

export type DeleteFlatEntityFromFlatEntityMapsOrThrowArgs<
  T extends FlatEntity,
> = {
  entityToDeleteId: string;
  flatEntityMaps: FlatEntityMaps<T>;
};

export const deleteFlatEntityFromFlatEntityMapsOrThrow = <
  T extends FlatEntity,
>({
  flatEntityMaps,
  entityToDeleteId,
}: DeleteFlatEntityFromFlatEntityMapsOrThrowArgs<T>): FlatEntityMaps<T> => {
  if (!isDefined(flatEntityMaps.byId[entityToDeleteId])) {
    throw new FlatEntityMapsException(
      'deleteFlatEntityFromFlatEntityMapsOrThrow: entity to delete not found',
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const updatedIdByUniversalIdentifierEntries = Object.entries(
    flatEntityMaps.idByUniversalIdentifier,
  ).filter(([_universalIdentifier, id]) => id !== entityToDeleteId);

  return {
    byId: removePropertiesFromRecord(flatEntityMaps.byId, [entityToDeleteId]),
    idByUniversalIdentifier: Object.fromEntries(
      updatedIdByUniversalIdentifierEntries,
    ),
  };
};
