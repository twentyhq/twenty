import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { buildObjectSideEffects } from 'src/engine/metadata-modules/object-side-effects/build-object-side-effects.util';
import { type SideEffectMetadataName } from 'src/engine/metadata-modules/object-side-effects/types/side-effect-flat-entities.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

export const runObjectSideEffectBuilders = ({
  allUniversalFlatEntityMaps,
  ownerFlatApplication,
  fieldsByObjectUniversalIdentifier,
  now,
}: {
  allUniversalFlatEntityMaps: AllFlatEntityMaps;
  ownerFlatApplication: FlatApplication;
  fieldsByObjectUniversalIdentifier: Map<string, UniversalFlatFieldMetadata[]>;
  now: string;
}): void => {
  const context = {
    flatApplication: ownerFlatApplication,
    now,
    existingViewUniversalIdentifiers: new Set(
      Object.keys(
        allUniversalFlatEntityMaps.flatViewMaps.byUniversalIdentifier,
      ),
    ),
    existingPageLayoutUniversalIdentifiers: new Set(
      Object.keys(
        allUniversalFlatEntityMaps.flatPageLayoutMaps.byUniversalIdentifier,
      ),
    ),
    junctionObjectByNameSingular: new Map(),
    existingFieldNamesByObjectUniversalIdentifier: new Map(),
  };

  for (const flatObjectMetadata of Object.values(
    allUniversalFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatObjectMetadata)) {
      continue;
    }

    const sideEffects = buildObjectSideEffects({
      object: flatObjectMetadata,
      fields:
        fieldsByObjectUniversalIdentifier.get(
          flatObjectMetadata.universalIdentifier,
        ) ?? [],
      context,
    });

    for (const metadataName of Object.keys(
      sideEffects,
    ) as SideEffectMetadataName[]) {
      const universalFlatEntityMapsToMutate = allUniversalFlatEntityMaps[
        getMetadataFlatEntityMapsKey(metadataName)
      ] as UniversalFlatEntityMaps<UniversalSyncableFlatEntity>;

      for (const universalFlatEntity of sideEffects[
        metadataName
      ] as UniversalSyncableFlatEntity[]) {
        addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
          universalFlatEntity,
          universalFlatEntityMapsToMutate,
        });
      }
    }
  }
};
