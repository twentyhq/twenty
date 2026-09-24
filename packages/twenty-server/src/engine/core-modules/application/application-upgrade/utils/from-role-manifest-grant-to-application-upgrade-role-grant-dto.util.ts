import { type RoleManifestGrant } from 'twenty-shared/application';

import {
  ApplicationUpgradeRoleGrantDTO,
  ApplicationUpgradeRoleGrantType,
} from 'src/engine/core-modules/application/application-upgrade/dtos/application-upgrade-role-grant.dto';

export const fromRoleManifestGrantToApplicationUpgradeRoleGrantDTO = (
  grant: RoleManifestGrant,
): ApplicationUpgradeRoleGrantDTO => ({
  type: ApplicationUpgradeRoleGrantType[grant.type],
  action: 'action' in grant ? grant.action : null,
  objectUniversalIdentifier:
    'objectUniversalIdentifier' in grant
      ? grant.objectUniversalIdentifier
      : null,
  fieldUniversalIdentifier:
    'fieldUniversalIdentifier' in grant ? grant.fieldUniversalIdentifier : null,
  permissionFlagUniversalIdentifier:
    'permissionFlagUniversalIdentifier' in grant
      ? grant.permissionFlagUniversalIdentifier
      : null,
});
