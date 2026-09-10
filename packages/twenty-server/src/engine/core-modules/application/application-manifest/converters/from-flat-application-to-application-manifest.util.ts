import { type ApplicationManifest } from 'twenty-shared/application';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export type FlatApplicationHeader = Pick<
  FlatApplication,
  | 'universalIdentifier'
  | 'name'
  | 'description'
  | 'logo'
  | 'billing'
  | 'packageJsonChecksum'
  | 'yarnLockChecksum'
>;

export const fromFlatApplicationToApplicationManifest = ({
  flatApplication,
  defaultRoleUniversalIdentifier,
  settingsFrontComponentUniversalIdentifier,
  uninstallLogicFunctionUniversalIdentifier,
}: {
  flatApplication: FlatApplicationHeader;
  defaultRoleUniversalIdentifier: string;
  settingsFrontComponentUniversalIdentifier?: string;
  uninstallLogicFunctionUniversalIdentifier?: string;
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
  ...(isDefined(settingsFrontComponentUniversalIdentifier)
    ? {
        settingsFrontComponent: {
          universalIdentifier: settingsFrontComponentUniversalIdentifier,
        },
      }
    : {}),
  ...(isDefined(uninstallLogicFunctionUniversalIdentifier)
    ? {
        uninstallLogicFunction: {
          universalIdentifier: uninstallLogicFunctionUniversalIdentifier,
        },
      }
    : {}),
  packageJsonChecksum: flatApplication.packageJsonChecksum,
  yarnLockChecksum: flatApplication.yarnLockChecksum,
});
