import {
  type FieldManifest,
  type IndexManifest,
  type ObjectFieldManifest,
  type ObjectManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatFieldMetadataToFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-field-metadata-to-field-manifest.util';
import { fromFlatIndexMetadataToIndexManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-index-metadata-to-index-manifest.util';
import { fromFlatObjectMetadataToObjectManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-object-metadata-to-object-manifest.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const compareByKeyThenUniversalIdentifier =
  <TFlatEntity extends { universalIdentifier: string }>(
    getKey: (flatEntity: TFlatEntity) => string,
  ) =>
  (left: TFlatEntity, right: TFlatEntity): number =>
    getKey(left).localeCompare(getKey(right)) ||
    left.universalIdentifier.localeCompare(right.universalIdentifier);

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

const getUnsupportedIndexReason = ({
  flatIndexMetadata,
  exportedObjectUniversalIdentifiers,
  fieldManifestByUniversalIdentifier,
}: {
  flatIndexMetadata: FlatIndexMetadata;
  exportedObjectUniversalIdentifiers: Set<string>;
  fieldManifestByUniversalIdentifier: Map<string, FieldManifest>;
}): string | undefined => {
  if (
    !exportedObjectUniversalIdentifiers.has(
      flatIndexMetadata.objectMetadataUniversalIdentifier,
    )
  ) {
    return 'index on an object outside the application';
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
  const exportedObjectUniversalIdentifiers = new Set(
    exportableObjects.map(
      ({ flatObjectMetadata }) => flatObjectMetadata.universalIdentifier,
    ),
  );
  const unsupportedObjectUniversalIdentifiers = new Set(
    flatObjectMetadatas
      .filter(
        ({ universalIdentifier }) =>
          !exportedObjectUniversalIdentifiers.has(universalIdentifier),
      )
      .map(({ universalIdentifier }) => universalIdentifier),
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
      unsupportedObjectUniversalIdentifiers.has(
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

    fieldManifestByUniversalIdentifier.set(
      flatFieldMetadata.universalIdentifier,
      fromFlatFieldMetadataToFieldManifest({ flatFieldMetadata }),
    );
    coverage.push({
      metadataName: 'fieldMetadata',
      universalIdentifier: flatFieldMetadata.universalIdentifier,
      status: ApplicationExportCoverageStatus.EXPORTED,
    });
  }

  const fieldManifests = [...fieldManifestByUniversalIdentifier.values()];

  const objects = exportableObjects.map(
    ({
      flatObjectMetadata,
      labelIdentifierFieldMetadataUniversalIdentifier,
    }) => {
      coverage.push({
        metadataName: 'objectMetadata',
        universalIdentifier: flatObjectMetadata.universalIdentifier,
        status: ApplicationExportCoverageStatus.EXPORTED,
      });

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
