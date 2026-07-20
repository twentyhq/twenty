import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import { isUpgradableApplicationSourceType } from '~/pages/settings/applications/utils/isUpgradableApplicationSourceType';

// A local dev apply (`yarn twenty apply`) sets the installed application's
// source type to LOCAL while leaving its registration untouched. When that
// registration is an upgradable (npm/tarball) source, the installation is
// running detached local code and can be re-attached to the registration's
// latest published version.
export const isDetachedLocalApplication = ({
  applicationSourceType,
  registrationSourceType,
}: {
  applicationSourceType: ApplicationRegistrationSourceType | null | undefined;
  registrationSourceType: ApplicationRegistrationSourceType | null | undefined;
}): boolean =>
  applicationSourceType === ApplicationRegistrationSourceType.LOCAL &&
  isUpgradableApplicationSourceType(registrationSourceType);
