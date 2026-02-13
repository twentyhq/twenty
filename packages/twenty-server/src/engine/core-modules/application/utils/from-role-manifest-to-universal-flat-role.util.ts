import { type RoleManifest } from 'twenty-shared/application';

import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';

export const fromRoleManifestToUniversalFlatRole = ({
  roleManifest,
  applicationUniversalIdentifier,
  now,
}: {
  roleManifest: RoleManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatRole => {
  return {
    universalIdentifier: roleManifest.universalIdentifier,
    applicationUniversalIdentifier,
    label: roleManifest.label,
    description: roleManifest.description ?? null,
    icon: roleManifest.icon ?? null,
    canUpdateAllSettings: roleManifest.canUpdateAllSettings ?? false,
    canAccessAllTools: roleManifest.canAccessAllTools ?? false,
    canReadAllObjectRecords: roleManifest.canReadAllObjectRecords ?? false,
    canUpdateAllObjectRecords: roleManifest.canUpdateAllObjectRecords ?? false,
    canSoftDeleteAllObjectRecords:
      roleManifest.canSoftDeleteAllObjectRecords ?? false,
    canDestroyAllObjectRecords:
      roleManifest.canDestroyAllObjectRecords ?? false,
    isEditable: true,
    canBeAssignedToUsers: roleManifest.canBeAssignedToUsers ?? true,
    canBeAssignedToAgents: roleManifest.canBeAssignedToAgents ?? true,
    canBeAssignedToApiKeys: roleManifest.canBeAssignedToApiKeys ?? true,
    roleTargetUniversalIdentifiers: [],
    rowLevelPermissionPredicateUniversalIdentifiers: [],
    rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
  };
};
