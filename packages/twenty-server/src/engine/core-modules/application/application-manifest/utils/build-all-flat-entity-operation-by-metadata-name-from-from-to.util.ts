import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import {
  type AllFlatEntityOperationByMetadataName,
  type FlatEntityToCreateDeleteUpdate,
} from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { isSystemUniqueFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/is-system-unique-flat-index-metadata.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';
import { shouldInferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration/utils/should-infer-deletion-from-missing-entities.util';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

const buildFlatEntityOperationForMetadata = <T extends AllMetadataName>({
  metadataName,
  fromFlatEntityMaps,
  toFlatEntityMaps,
  buildOptions,
}: {
  metadataName: T;
  fromFlatEntityMaps: MetadataUniversalFlatEntityMaps<T>;
  toFlatEntityMaps: MetadataUniversalFlatEntityMaps<T>;
  buildOptions: WorkspaceMigrationBuilderOptions;
}): FlatEntityToCreateDeleteUpdate<T> => {
  const fromByUniversalIdentifier = fromFlatEntityMaps.byUniversalIdentifier;
  const toByUniversalIdentifier = toFlatEntityMaps.byUniversalIdentifier;

  const flatEntityToCreate = Object.values(toByUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (toFlatEntity) =>
        !isDefined(fromByUniversalIdentifier[toFlatEntity.universalIdentifier]),
    );

  const flatEntityToDelete = shouldInferDeletionFromMissingEntities({
    buildOptions,
    metadataName,
  })
    ? Object.values(fromByUniversalIdentifier)
        .filter(isDefined)
        .filter(
          (fromFlatEntity) =>
            !isDefined(
              toByUniversalIdentifier[fromFlatEntity.universalIdentifier],
            ),
        )
        // The engine owns the unique backing index and the manifest never declares it, so its
        // absence must not be inferred as a deletion. Scoped to index metadata for now: a generic
        // `isSystemSideEffect` check would also match system fields (`id` is
        // `isSystemSideEffect + isUnique`) and wrongly shield their deletions from validation.
        // Will broaden to all `isSystemSideEffect` entities once system fields become a side effect.
        .filter((fromFlatEntity) => {
          if (metadataName !== ALL_METADATA_NAME.index) {
            return true;
          }

          return !isSystemUniqueFlatIndexMetadata(
            fromFlatEntity as unknown as {
              isSystemSideEffect: boolean;
              isUnique: boolean;
            },
          );
        })
    : [];

  const flatEntityToUpdate = Object.values(fromByUniversalIdentifier)
    .filter(isDefined)
    .map((fromFlatEntity) => {
      const toFlatEntity =
        toByUniversalIdentifier[fromFlatEntity.universalIdentifier];

      if (!isDefined(toFlatEntity)) {
        return undefined;
      }

      const update = compareTwoFlatEntity({
        fromUniversalFlatEntity: fromFlatEntity,
        toUniversalFlatEntity: toFlatEntity,
        metadataName,
      });

      return isDefined(update) ? toFlatEntity : undefined;
    })
    .filter(isDefined);

  return {
    flatEntityToCreate,
    flatEntityToUpdate,
    flatEntityToDelete,
  };
};

export const buildAllFlatEntityOperationByMetadataNameFromFromTo = ({
  fromAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
  buildOptions,
}: {
  fromAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
  buildOptions: WorkspaceMigrationBuilderOptions;
}): AllFlatEntityOperationByMetadataName => {
  const allFlatEntityOperationByMetadataName: AllFlatEntityOperationByMetadataName =
    {};

  for (const metadataName of Object.values(ALL_METADATA_NAME)) {
    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);

    const flatEntityOperation = buildFlatEntityOperationForMetadata({
      metadataName,
      fromFlatEntityMaps: fromAllFlatEntityMaps[
        flatEntityMapsKey
      ] as unknown as MetadataUniversalFlatEntityMaps<typeof metadataName>,
      toFlatEntityMaps: toAllUniversalFlatEntityMaps[
        flatEntityMapsKey
      ] as unknown as MetadataUniversalFlatEntityMaps<typeof metadataName>,
      buildOptions,
    });

    if (
      flatEntityOperation.flatEntityToCreate.length === 0 &&
      flatEntityOperation.flatEntityToUpdate.length === 0 &&
      flatEntityOperation.flatEntityToDelete.length === 0
    ) {
      continue;
    }

    (
      allFlatEntityOperationByMetadataName as Record<
        string,
        FlatEntityToCreateDeleteUpdate<AllMetadataName>
      >
    )[metadataName] = flatEntityOperation;
  }

  return allFlatEntityOperationByMetadataName;
};
