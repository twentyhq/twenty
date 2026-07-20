import { isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

// A local dev apply (`yarn twenty apply`) detaches the installed application
// from its registration: the code running on the workspace no longer matches
// any published version. We tag the persisted version so the UI can surface
// that the app is running detached code and offer to re-attach to the
// registration's latest published version.
export const LOCAL_APPLICATION_VERSION_SUFFIX = '(local)';

export const buildApplicationVersionForSourceType = ({
  packageJsonVersion,
  sourceType,
}: {
  packageJsonVersion: string | null | undefined;
  sourceType: ApplicationRegistrationSourceType;
}): string | null | undefined => {
  if (
    isDefined(packageJsonVersion) &&
    sourceType === ApplicationRegistrationSourceType.LOCAL
  ) {
    return `${packageJsonVersion} ${LOCAL_APPLICATION_VERSION_SUFFIX}`;
  }

  return packageJsonVersion;
};
