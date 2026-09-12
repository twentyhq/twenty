import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';

const RESOLVABLE_ON_INSTALL_STATUSES = [
  ApplicationExportCoverageStatus.EXPORTED,
  ApplicationExportCoverageStatus.ENGINE_DERIVED,
];

export const getResolvableReferenceUniversalIdentifiers = ({
  coverage,
  metadataName,
}: {
  coverage: ApplicationExportCoverageEntry[];
  metadataName: AllMetadataName;
}): ReadonlySet<string> =>
  new Set(
    coverage
      .filter(
        (coverageEntry) =>
          coverageEntry.metadataName === metadataName &&
          RESOLVABLE_ON_INSTALL_STATUSES.includes(coverageEntry.status),
      )
      .map(({ universalIdentifier }) => universalIdentifier),
  );
