import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

type AddUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrowArgs<
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
> = {
  universalFlatEntity: T;
  universalFlatEntityMapsToMutate: UniversalFlatEntityMaps<T>;
};

export const addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow =
  <T extends SyncableFlatEntity | UniversalSyncableFlatEntity>({
    universalFlatEntity: flatEntity,
    universalFlatEntityMapsToMutate,
  }: AddUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrowArgs<T>): void => {
    if (
      isDefined(
        universalFlatEntityMapsToMutate.byUniversalIdentifier[
          flatEntity.universalIdentifier
        ],
      )
    ) {
      throw new FlatEntityMapsException(
        'addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow: flat entity to add already exists',
        FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
      );
    }

    universalFlatEntityMapsToMutate.byUniversalIdentifier[
      flatEntity.universalIdentifier
    ] = flatEntity;
  };
