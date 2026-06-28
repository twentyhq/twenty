import semver from 'semver';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const assertAppDependencyInstallable = ({
  dependentUniversalIdentifier,
  dependencyPackageName,
  dependencyUniversalIdentifier,
  resolvedVersion,
  versionRange,
  installingUniversalIdentifiers,
}: {
  dependentUniversalIdentifier: string;
  dependencyPackageName: string;
  dependencyUniversalIdentifier: string;
  resolvedVersion: string;
  versionRange: string;
  installingUniversalIdentifiers: Set<string>;
}): void => {
  if (!semver.satisfies(resolvedVersion, versionRange)) {
    throw new ApplicationException(
      `App "${dependentUniversalIdentifier}" depends on "${dependencyPackageName}@${versionRange}" but the available version is ${resolvedVersion}.`,
      ApplicationExceptionCode.APP_DEPENDENCY_VERSION_INCOMPATIBLE,
    );
  }

  if (
    dependencyUniversalIdentifier === dependentUniversalIdentifier ||
    installingUniversalIdentifiers.has(dependencyUniversalIdentifier)
  ) {
    throw new ApplicationException(
      `Circular app dependency detected involving "${dependencyUniversalIdentifier}".`,
      ApplicationExceptionCode.APP_DEPENDENCY_CYCLE_DETECTED,
    );
  }
};
