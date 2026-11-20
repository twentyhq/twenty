import { type JobGroupManifest } from 'twenty-shared/application';

import { fromFlatJobGroupToJobGroupManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-job-group-to-job-group-manifest.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const reconstructJobGroupsManifest = ({
  applicationAllFlatEntityMaps,
}: {
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
}): {
  jobGroups: JobGroupManifest[];
  coverage: ApplicationExportCoverageEntry[];
} => {
  const flatJobGroups = sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatJobGroupMaps,
  );

  return {
    jobGroups: flatJobGroups.map(fromFlatJobGroupToJobGroupManifest),
    coverage: flatJobGroups.map((flatJobGroup) =>
      buildExportedCoverageEntry({
        metadataName: 'jobGroup',
        flatEntity: flatJobGroup,
      }),
    ),
  };
};
