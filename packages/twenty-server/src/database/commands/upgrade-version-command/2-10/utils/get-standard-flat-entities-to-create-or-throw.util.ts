import { isDefined } from 'twenty-shared/utils';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';

export const getStandardFlatEntitiesToCreateOrThrow = <
  T extends SyncableFlatEntity,
>({
  standardFlatEntityMaps,
  existingFlatEntityMaps,
  universalIdentifiers,
}: {
  standardFlatEntityMaps: FlatEntityMaps<T>;
  existingFlatEntityMaps: FlatEntityMaps<T>;
  universalIdentifiers: string[];
}): T[] =>
  universalIdentifiers.flatMap((universalIdentifier) => {
    const standardFlatEntity =
      standardFlatEntityMaps.byUniversalIdentifier[universalIdentifier];

    if (!isDefined(standardFlatEntity)) {
      throw new Error(`Could not find standard entity ${universalIdentifier}`);
    }

    if (
      isDefined(
        existingFlatEntityMaps.byUniversalIdentifier[universalIdentifier],
      )
    ) {
      return [];
    }

    return [standardFlatEntity];
  });

export const getExistingOrStandardFlatEntityOrThrow = <
  T extends SyncableFlatEntity,
>({
  standardFlatEntityMaps,
  existingFlatEntityMaps,
  universalIdentifier,
}: {
  standardFlatEntityMaps: FlatEntityMaps<T>;
  existingFlatEntityMaps: FlatEntityMaps<T>;
  universalIdentifier: string;
}): T => {
  const existingFlatEntity =
    existingFlatEntityMaps.byUniversalIdentifier[universalIdentifier];

  if (isDefined(existingFlatEntity)) {
    return existingFlatEntity;
  }

  const standardFlatEntity =
    standardFlatEntityMaps.byUniversalIdentifier[universalIdentifier];

  if (!isDefined(standardFlatEntity)) {
    throw new Error(`Could not find standard entity ${universalIdentifier}`);
  }

  return standardFlatEntity;
};
