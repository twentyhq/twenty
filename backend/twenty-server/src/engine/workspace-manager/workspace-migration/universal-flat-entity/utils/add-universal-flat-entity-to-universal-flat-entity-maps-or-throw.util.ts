import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

type AddUniversalFlatEntityToUniversalFlatEntityMapsOrThrowArgs<
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
> = {
  universalFlatEntity: T;
  universalFlatEntityMaps: UniversalFlatEntityMaps<T>;
};

export const addUniversalFlatEntityToUniversalFlatEntityMapsOrThrow = <
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
>({
  universalFlatEntity,
  universalFlatEntityMaps,
}: AddUniversalFlatEntityToUniversalFlatEntityMapsOrThrowArgs<T>): UniversalFlatEntityMaps<T> => {
  if (
    isDefined(
      universalFlatEntityMaps.byUniversalIdentifier[
        universalFlatEntity.universalIdentifier
      ],
    )
  ) {
    throw new FlatEntityMapsException(
      'addUniversalFlatEntityToUniversalFlatEntityMapsOrThrow: flat entity to add already exists',
      FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
    );
  }

  return {
    byUniversalIdentifier: {
      ...universalFlatEntityMaps.byUniversalIdentifier,
      [universalFlatEntity.universalIdentifier]: universalFlatEntity,
    },
  };
};
