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
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { isSystemSideEffectFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/is-system-side-effect-flat-entity.util';
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
        .filter(
          (fromFlatEntity) =>
            !isSystemSideEffectFlatEntity(
              fromFlatEntity as unknown as MetadataUniversalFlatEntity<AllMetadataName>,
            ),
        )
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
