import { type ApplicationManifest } from 'twenty-shared/application';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const fromFlatApplicationToApplicationManifest = ({
  flatApplication,
  defaultRoleUniversalIdentifier,
}: {
  flatApplication: FlatApplication;
  defaultRoleUniversalIdentifier: string;
}): ApplicationManifest => ({
  universalIdentifier: flatApplication.universalIdentifier,
  displayName: flatApplication.name,
  description: flatApplication.description ?? '',
  defaultRoleUniversalIdentifier,
  ...(isDefined(flatApplication.logo) ? { logo: flatApplication.logo } : {}),
  ...(isDefined(flatApplication.billing) &&
  !isEmptyObject(flatApplication.billing)
    ? { billing: flatApplication.billing }
    : {}),
  packageJsonChecksum: flatApplication.packageJsonChecksum,
  yarnLockChecksum: flatApplication.yarnLockChecksum,
});
