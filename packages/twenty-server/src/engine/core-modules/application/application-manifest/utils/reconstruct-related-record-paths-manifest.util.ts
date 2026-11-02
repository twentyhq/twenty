/* @license Enterprise */

import { type RelatedRecordPathManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatRelatedRecordPathToRelatedRecordPathManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-related-record-path-to-related-record-path-manifest.util';
import { fromRelatedRecordPathManifestToUniversalFlatRelatedRecordPath } from 'src/engine/core-modules/application/application-manifest/converters/from-related-record-path-manifest-to-universal-flat-related-record-path.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { getUnreproducedPropertiesReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unreproduced-properties-reason.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';

const convertFlatRelatedRecordPath = (
  flatRelatedRecordPath: FlatRelatedRecordPath,
): { manifest: RelatedRecordPathManifest } | { reason: string } => {
  const manifest = fromFlatRelatedRecordPathToRelatedRecordPathManifest({
    flatRelatedRecordPath,
  });
  const reason = getUnreproducedPropertiesReason({
    metadataName: 'relatedRecordPath',
    flatEntity: flatRelatedRecordPath,
    reproducedUniversalFlatEntity:
      fromRelatedRecordPathManifestToUniversalFlatRelatedRecordPath({
        relatedRecordPathManifest: manifest,
        applicationUniversalIdentifier:
          flatRelatedRecordPath.applicationUniversalIdentifier,
        now: flatRelatedRecordPath.updatedAt,
      }),
  });

  return isDefined(reason) ? { reason } : { manifest };
};

export const reconstructRelatedRecordPathsManifest = ({
  applicationAllFlatEntityMaps,
}: {
  applicationAllFlatEntityMaps: Pick<
    AllFlatEntityMaps,
    'flatRelatedRecordPathMaps'
  >;
}): {
  relatedRecordPaths: RelatedRecordPathManifest[];
  coverage: ApplicationExportCoverageEntry[];
} => {
  const relatedRecordPaths: RelatedRecordPathManifest[] = [];
  const coverage: ApplicationExportCoverageEntry[] = [];

  for (const flatRelatedRecordPath of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatRelatedRecordPathMaps,
  )) {
    const conversion = convertFlatRelatedRecordPath(flatRelatedRecordPath);

    if ('reason' in conversion) {
      coverage.push({
        metadataName: 'relatedRecordPath',
        universalIdentifier: flatRelatedRecordPath.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: conversion.reason,
      });
      continue;
    }

    coverage.push(
      buildExportedCoverageEntry({
        metadataName: 'relatedRecordPath',
        flatEntity: flatRelatedRecordPath,
      }),
    );
    relatedRecordPaths.push(conversion.manifest);
  }

  return { relatedRecordPaths, coverage };
};
