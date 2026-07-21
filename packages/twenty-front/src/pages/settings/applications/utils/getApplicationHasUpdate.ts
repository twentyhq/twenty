import { isDefined } from 'twenty-shared/utils';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import { isNewerSemver } from '~/pages/settings/applications/utils/isNewerSemver';
import { isUpgradableApplicationSourceType } from '~/pages/settings/applications/utils/isUpgradableApplicationSourceType';

export const getApplicationHasUpdate = ({
  applicationSourceType,
  registrationSourceType,
  currentVersion,
  latestAvailableVersion,
}: {
  applicationSourceType: ApplicationRegistrationSourceType | null | undefined;
  registrationSourceType: ApplicationRegistrationSourceType | null | undefined;
  currentVersion: string | null | undefined;
  latestAvailableVersion: string | null | undefined;
}): boolean => {
  if (
    !isUpgradableApplicationSourceType(registrationSourceType) ||
    !isDefined(latestAvailableVersion) ||
    !isDefined(currentVersion)
  ) {
    return false;
  }

  const isLocalApplication =
    applicationSourceType === ApplicationRegistrationSourceType.LOCAL;

  return (
    isLocalApplication || isNewerSemver(latestAvailableVersion, currentVersion)
  );
};
