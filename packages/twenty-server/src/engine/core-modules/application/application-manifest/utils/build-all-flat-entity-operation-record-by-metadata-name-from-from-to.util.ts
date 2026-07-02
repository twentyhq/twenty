import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import {
  type AllFlatEntityOperationRecordByMetadataName,
  type FlatEntityOperationRecord,
} from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { isSystemUniqueFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/is-system-unique-flat-index-metadata.util';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';
import { shouldInferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration/utils/should-infer-deletion-from-missing-entities.util';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

const toRecordByUniversalIdentifier = <T extends AllMetadataName>(
  flatEntities: MetadataUniversalFlatEntity<T>[],
): Record<string, MetadataUniversalFlatEntity<T>> =>
  Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  );

const buildFlatEntityOperationRecordForMetadata = <T extends AllMetadataName>({
  metadataName,
  fromFlatEntityMaps,
  toFlatEntityMaps,
  buildOptions,
}: {
  metadataName: T;
  fromFlatEntityMaps: MetadataUniversalFlatEntityMaps<T>;
  toFlatEntityMaps: MetadataUniversalFlatEntityMaps<T>;
  buildOptions: WorkspaceMigrationBuilderOptions;
}): FlatEntityOperationRecord<T> => {
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
    flatEntityToCreate: toRecordByUniversalIdentifier(flatEntityToCreate),
    flatEntityToUpdate: toRecordByUniversalIdentifier(flatEntityToUpdate),
    flatEntityToDelete: toRecordByUniversalIdentifier(flatEntityToDelete),
  };
};

// Record-native counterpart of buildAllFlatEntityOperationByMetadataNameFromFromTo:
// the manifest already lives in map form (byUniversalIdentifier), so building the
// canonical record matrix directly avoids the map -> array -> map round-trip the
// side-effect engine used to pay for.
export const buildAllFlatEntityOperationRecordByMetadataNameFromFromTo = ({
  fromAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
  buildOptions,
}: {
  fromAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
  buildOptions: WorkspaceMigrationBuilderOptions;
}): AllFlatEntityOperationRecordByMetadataName => {
  const allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName =
    {};

  for (const metadataName of Object.values(ALL_METADATA_NAME)) {
    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);

    const flatEntityOperationRecord = buildFlatEntityOperationRecordForMetadata(
      {
        metadataName,
        fromFlatEntityMaps: fromAllFlatEntityMaps[
          flatEntityMapsKey
        ] as unknown as MetadataUniversalFlatEntityMaps<typeof metadataName>,
        toFlatEntityMaps: toAllUniversalFlatEntityMaps[
          flatEntityMapsKey
        ] as unknown as MetadataUniversalFlatEntityMaps<typeof metadataName>,
        buildOptions,
      },
    );

    if (
      Object.keys(flatEntityOperationRecord.flatEntityToCreate).length === 0 &&
      Object.keys(flatEntityOperationRecord.flatEntityToUpdate).length === 0 &&
      Object.keys(flatEntityOperationRecord.flatEntityToDelete).length === 0
    ) {
      continue;
    }

    (
      allFlatEntityOperationRecordByMetadataName as Record<
        string,
        FlatEntityOperationRecord<AllMetadataName>
      >
    )[metadataName] = flatEntityOperationRecord;
  }

  return allFlatEntityOperationRecordByMetadataName;
};
