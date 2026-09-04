import {
  type FieldManifest,
  type IndexManifest,
  type ObjectFieldManifest,
  type ObjectManifest,
} from 'twenty-shared/application';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';

import { fromFlatFieldMetadataToFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-field-metadata-to-field-manifest.util';
import { fromFlatIndexMetadataToIndexManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-index-metadata-to-index-manifest.util';
import { fromFlatObjectMetadataToObjectManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-object-metadata-to-object-manifest.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { compareByCodePoint } from 'src/engine/core-modules/application/application-manifest/utils/compare-by-code-point.util';
import { getUnsupportedRelationFieldReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unsupported-relation-field-reason.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type WorkspaceLocalStateProperties = Pick<
  FlatObjectMetadata | FlatFieldMetadata,
  'universalIdentifier' | 'isActive' | 'overrides'
>;

const compareByKeyThenUniversalIdentifier =
  <TFlatEntity extends { universalIdentifier: string }>(
    getKey: (flatEntity: TFlatEntity) => string,
  ) =>
  (left: TFlatEntity, right: TFlatEntity): number =>
    compareByCodePoint(getKey(left), getKey(right)) ||
    compareByCodePoint(left.universalIdentifier, right.universalIdentifier);

const toObjectFieldManifest = ({
  objectUniversalIdentifier: _objectUniversalIdentifier,
  ...objectFieldManifest
}: FieldManifest): ObjectFieldManifest => objectFieldManifest;

const isKeptLabelIdentifierField = ({
  flatFieldMetadata,
  flatObjectMetadata,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadata | undefined;
}): boolean =>
  isDefined(flatObjectMetadata) &&
  flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
    flatFieldMetadata.universalIdentifier &&
  !flatFieldMetadata.isSystem;

const getWorkspaceLocalStateReason = ({
  isActive,
  overrides,
}: WorkspaceLocalStateProperties): string | undefined => {
  const reasons = [
    ...(isActive ? [] : ['deactivated in this workspace, exported active']),
    ...(isDefined(overrides) && !isEmptyObject(overrides)
      ? ['workspace overrides not exported']
      : []),
  ];

  return reasons.length > 0 ? reasons.join(', ') : undefined;
};

const buildExportedCoverageEntry = ({
  metadataName,
  flatEntity,
}: {
  metadataName: 'objectMetadata' | 'fieldMetadata';
  flatEntity: WorkspaceLocalStateProperties;
}): ApplicationExportCoverageEntry => {
  const reason = getWorkspaceLocalStateReason(flatEntity);

  return {
    metadataName,
    universalIdentifier: flatEntity.universalIdentifier,
    status: ApplicationExportCoverageStatus.EXPORTED,
    ...(isDefined(reason) ? { reason } : {}),
  };
};

const getUnsupportedIndexReason = ({
  flatIndexMetadata,
  applicationObjectUniversalIdentifiers,
  exportedObjectUniversalIdentifiers,
  fieldManifestByUniversalIdentifier,
}: {
  flatIndexMetadata: FlatIndexMetadata;
  applicationObjectUniversalIdentifiers: Set<string>;
  exportedObjectUniversalIdentifiers: Set<string>;
  fieldManifestByUniversalIdentifier: Map<string, FieldManifest>;
}): string | undefined => {
  const objectUniversalIdentifier =
    flatIndexMetadata.objectMetadataUniversalIdentifier;

  if (!applicationObjectUniversalIdentifiers.has(objectUniversalIdentifier)) {
    return 'index on an object outside the application';
  }

  if (!exportedObjectUniversalIdentifiers.has(objectUniversalIdentifier)) {
    return 'index on an unsupported object';
  }

  if (isDefined(flatIndexMetadata.indexWhereClause)) {
    return 'partial index';
  }

  if (
    flatIndexMetadata.universalFlatIndexFieldMetadatas.some(
      ({ fieldMetadataUniversalIdentifier }) =>
        !fieldManifestByUniversalIdentifier.has(
          fieldMetadataUniversalIdentifier,
        ),
    )
  ) {
    return 'index on a field that is not exported';
  }

  return undefined;
};

export const reconstructDataModelManifest = ({
  applicationAllFlatEntityMaps,
}: {
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
}): {
  objects: ObjectManifest[];
  fields: FieldManifest[];
  indexes: IndexManifest[];
  coverage: ApplicationExportCoverageEntry[];
} => {
  const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
    applicationAllFlatEntityMaps;
  const coverage: ApplicationExportCoverageEntry[] = [];

  const flatObjectMetadatas = Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .sort(
      compareByKeyThenUniversalIdentifier(({ nameSingular }) => nameSingular),
    );
  const exportableObjects = flatObjectMetadatas.flatMap(
    (flatObjectMetadata) => {
      const labelIdentifierFieldMetadataUniversalIdentifier =
        flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier;

      if (isDefined(labelIdentifierFieldMetadataUniversalIdentifier)) {
        return [
          {
            flatObjectMetadata,
            labelIdentifierFieldMetadataUniversalIdentifier,
          },
        ];
      }

      coverage.push({
        metadataName: 'objectMetadata',
        universalIdentifier: flatObjectMetadata.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: 'object without label identifier field',
      });

      return [];
    },
  );
  const applicationObjectUniversalIdentifiers = new Set(
    flatObjectMetadatas.map(({ universalIdentifier }) => universalIdentifier),
  );
  const exportedObjectUniversalIdentifiers = new Set(
    exportableObjects.map(
      ({ flatObjectMetadata }) => flatObjectMetadata.universalIdentifier,
    ),
  );

  const fieldManifestByUniversalIdentifier = new Map<string, FieldManifest>();

  for (const flatFieldMetadata of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .sort(compareByKeyThenUniversalIdentifier(({ name }) => name))) {
    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.objectMetadataUniversalIdentifier
      ];

    if (
      flatFieldMetadata.isSystemSideEffect &&
      !isKeptLabelIdentifierField({ flatFieldMetadata, flatObjectMetadata })
    ) {
      coverage.push({
        metadataName: 'fieldMetadata',
        universalIdentifier: flatFieldMetadata.universalIdentifier,
        status: ApplicationExportCoverageStatus.ENGINE_DERIVED,
      });
      continue;
    }

    if (
      applicationObjectUniversalIdentifiers.has(
        flatFieldMetadata.objectMetadataUniversalIdentifier,
      ) &&
      !exportedObjectUniversalIdentifiers.has(
        flatFieldMetadata.objectMetadataUniversalIdentifier,
      )
    ) {
      coverage.push({
        metadataName: 'fieldMetadata',
        universalIdentifier: flatFieldMetadata.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: 'field of an unsupported object',
      });
      continue;
    }

    const unsupportedRelationReason =
      getUnsupportedRelationFieldReason(flatFieldMetadata);

    if (isDefined(unsupportedRelationReason)) {
      coverage.push({
        metadataName: 'fieldMetadata',
        universalIdentifier: flatFieldMetadata.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: unsupportedRelationReason,
      });
      continue;
    }

    fieldManifestByUniversalIdentifier.set(
      flatFieldMetadata.universalIdentifier,
      fromFlatFieldMetadataToFieldManifest({ flatFieldMetadata }),
    );
    coverage.push(
      buildExportedCoverageEntry({
        metadataName: 'fieldMetadata',
        flatEntity: flatFieldMetadata,
      }),
    );
  }

  const fieldManifests = [...fieldManifestByUniversalIdentifier.values()];

  const objects = exportableObjects.map(
    ({
      flatObjectMetadata,
      labelIdentifierFieldMetadataUniversalIdentifier,
    }) => {
      coverage.push(
        buildExportedCoverageEntry({
          metadataName: 'objectMetadata',
          flatEntity: flatObjectMetadata,
        }),
      );

      return fromFlatObjectMetadataToObjectManifest({
        flatObjectMetadata,
        fields: fieldManifests
          .filter(
            (fieldManifest) =>
              fieldManifest.objectUniversalIdentifier ===
              flatObjectMetadata.universalIdentifier,
          )
          .map(toObjectFieldManifest),
        labelIdentifierFieldMetadataUniversalIdentifier,
      });
    },
  );

  const fields = fieldManifests.filter(
    (fieldManifest) =>
      !exportedObjectUniversalIdentifiers.has(
        fieldManifest.objectUniversalIdentifier,
      ),
  );

  const indexes: IndexManifest[] = [];

  for (const flatIndexMetadata of Object.values(
    flatIndexMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .sort(compareByKeyThenUniversalIdentifier(({ name }) => name))) {
    if (flatIndexMetadata.isSystemSideEffect) {
      coverage.push({
        metadataName: 'index',
        universalIdentifier: flatIndexMetadata.universalIdentifier,
        status: ApplicationExportCoverageStatus.ENGINE_DERIVED,
      });
      continue;
    }

    const unsupportedReason = getUnsupportedIndexReason({
      flatIndexMetadata,
      applicationObjectUniversalIdentifiers,
      exportedObjectUniversalIdentifiers,
      fieldManifestByUniversalIdentifier,
    });

    if (isDefined(unsupportedReason)) {
      coverage.push({
        metadataName: 'index',
        universalIdentifier: flatIndexMetadata.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: unsupportedReason,
      });
      continue;
    }

    indexes.push(fromFlatIndexMetadataToIndexManifest({ flatIndexMetadata }));
    coverage.push({
      metadataName: 'index',
      universalIdentifier: flatIndexMetadata.universalIdentifier,
      status: ApplicationExportCoverageStatus.EXPORTED,
    });
  }

  return { objects, fields, indexes, coverage };
};
