import semver from 'semver';
import { type RequiredApplicationManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';

export const findUnsatisfiedRequiredApplicationReasons = ({
  requiredApplications,
  flatApplicationMaps,
}: {
  requiredApplications: RequiredApplicationManifest[];
  flatApplicationMaps: FlatApplicationCacheMaps;
}): string[] =>
  requiredApplications.flatMap(({ universalIdentifier, versionRange }) => {
    const normalizedVersionRange = semver.validRange(versionRange);

    if (!isDefined(normalizedVersionRange)) {
      return [
        `"${versionRange}" is not a valid version range for application ${universalIdentifier}`,
      ];
    }

    const installedFlatApplication =
      findActiveFlatApplicationByUniversalIdentifier(
        flatApplicationMaps,
        universalIdentifier,
      );

    if (!isDefined(installedFlatApplication)) {
      return [
        `application ${universalIdentifier} (${versionRange}) is not installed`,
      ];
    }

    const isSatisfied = isDefined(installedFlatApplication.version)
      ? semver.satisfies(installedFlatApplication.version, versionRange, {
          includePrerelease: true,
        })
      : normalizedVersionRange === '*';

    return isSatisfied
      ? []
      : [
          `application "${installedFlatApplication.name}" (${universalIdentifier}) is installed at version ${installedFlatApplication.version ?? 'unknown'}, which does not satisfy ${versionRange}`,
        ];
  });
