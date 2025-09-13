import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/core-modules/common/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';

export const findFlatEntityByIdInFlatEntityMapsOrThrow = <
  T extends FlatEntity,
>({
  flatEntityMaps,
  flatEntityId,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityId: string;
}): T => {
  const flatEntity = flatEntityMaps.byId[flatEntityId];

  if (!isDefined(flatEntity)) {
    throw new FlatEntityMapsException(
      t`Could not find flat entity in maps`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return flatEntity;
};
