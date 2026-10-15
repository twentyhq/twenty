import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';

export const restrictFlatEntityMapsToApplication = <
  TFlatEntity extends SyncableFlatEntity,
>({
  flatEntityMaps,
  applicationId,
}: {
  flatEntityMaps: FlatEntityMaps<TFlatEntity>;
  applicationId: string;
}): FlatEntityMaps<TFlatEntity> => {
  const universalIdentifiers =
    flatEntityMaps.universalIdentifiersByApplicationId[applicationId] ?? [];

  const byUniversalIdentifier: Partial<Record<string, TFlatEntity>> = {};
  const universalIdentifierById: Partial<Record<string, string>> = {};

  for (const universalIdentifier of universalIdentifiers) {
    const flatEntity =
      flatEntityMaps.byUniversalIdentifier[universalIdentifier];

    if (!isDefined(flatEntity)) {
      continue;
    }

    byUniversalIdentifier[universalIdentifier] = flatEntity;
    universalIdentifierById[flatEntity.id] = universalIdentifier;
  }

  return {
    byUniversalIdentifier,
    universalIdentifierById,
    universalIdentifiersByApplicationId: {
      [applicationId]: [...universalIdentifiers],
    },
  };
};
