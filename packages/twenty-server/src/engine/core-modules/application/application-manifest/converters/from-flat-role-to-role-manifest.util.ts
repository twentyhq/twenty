import { type RoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const fromFlatRoleToRoleManifest = ({
  flatRole,
  permissionFlagUniversalIdentifiers,
}: {
  flatRole: FlatRole;
  permissionFlagUniversalIdentifiers: string[];
}): RoleManifest => {
  return {
    universalIdentifier: flatRole.universalIdentifier,
    label: flatRole.label,
    ...(isDefined(flatRole.description)
      ? { description: flatRole.description }
      : {}),
    ...(isDefined(flatRole.icon) ? { icon: flatRole.icon } : {}),
    canUpdateAllSettings: flatRole.canUpdateAllSettings,
    canAccessAllTools: flatRole.canAccessAllTools,
    canReadAllObjectRecords: flatRole.canReadAllObjectRecords,
    canUpdateAllObjectRecords: flatRole.canUpdateAllObjectRecords,
    canSoftDeleteAllObjectRecords: flatRole.canSoftDeleteAllObjectRecords,
    canDestroyAllObjectRecords: flatRole.canDestroyAllObjectRecords,
    canBeAssignedToUsers: flatRole.canBeAssignedToUsers,
    canBeAssignedToAgents: flatRole.canBeAssignedToAgents,
    canBeAssignedToApiKeys: flatRole.canBeAssignedToApiKeys,
    ...(permissionFlagUniversalIdentifiers.length > 0
      ? { permissionFlagUniversalIdentifiers }
      : {}),
  };
};
