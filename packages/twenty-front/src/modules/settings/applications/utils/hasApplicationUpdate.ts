import { isDefined } from 'twenty-shared/utils';
import { type ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import { isNewerSemver } from '@/settings/applications/utils/isNewerSemver';
import { isUpgradableApplicationSourceType } from '@/settings/applications/utils/isUpgradableApplicationSourceType';

export const hasApplicationUpdate = ({
  sourceType,
  currentVersion,
  latestAvailableVersion,
}: {
  sourceType: ApplicationRegistrationSourceType | null | undefined;
  currentVersion: string | null | undefined;
  latestAvailableVersion: string | null | undefined;
}): boolean =>
  isUpgradableApplicationSourceType(sourceType) &&
  isDefined(latestAvailableVersion) &&
  isDefined(currentVersion) &&
  isNewerSemver(latestAvailableVersion, currentVersion);
