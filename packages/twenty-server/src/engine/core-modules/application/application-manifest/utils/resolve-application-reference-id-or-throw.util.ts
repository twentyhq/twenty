import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

export const resolveApplicationReferenceIdOrThrow = <
  T extends SyncableFlatEntity,
>({
  flatEntityMaps,
  universalIdentifier,
  referenceLabel,
  exceptionCode,
  ownerApplicationId,
}: {
  flatEntityMaps: UniversalFlatEntityMaps<T>;
  universalIdentifier: string;
  referenceLabel: string;
  exceptionCode: ApplicationExceptionCode;
  ownerApplicationId?: string;
}): string => {
  const flatEntity = findFlatEntityByUniversalIdentifier({
    flatEntityMaps,
    universalIdentifier,
  });

  if (
    !isDefined(flatEntity) ||
    (isDefined(ownerApplicationId) &&
      flatEntity.applicationId !== ownerApplicationId)
  ) {
    throw new ApplicationException(
      `Failed to resolve ${referenceLabel} for universalIdentifier ${universalIdentifier}`,
      exceptionCode,
    );
  }

  return flatEntity.id;
};
