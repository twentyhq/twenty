import {
  getRecordsPermissionsFromRoleManifest,
  type RoleManifest,
} from 'twenty-shared/application';

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
  const recordsPermissions = getRecordsPermissionsFromRoleManifest({
    role: roleManifest,
  });

  return {
    universalIdentifier: roleManifest.universalIdentifier,
    applicationUniversalIdentifier,
    label: roleManifest.label,
    description: roleManifest.description ?? null,
    icon: roleManifest.icon ?? null,
    canUpdateAllSettings: roleManifest.canUpdateAllSettings ?? false,
    canAccessAllTools: roleManifest.canAccessAllTools ?? false,
    canAccessAllAgentChatChannels:
      roleManifest.canAccessAllAgentChatChannels ?? false,
    canReadAllObjectRecords: recordsPermissions.canReadAllObjectRecords,
    canCreateAllObjectRecords:
      roleManifest.recordsPermissions?.canCreateAllRecords ??
      recordsPermissions.canUpdateAllObjectRecords,
    canUpdateAllObjectRecords: recordsPermissions.canUpdateAllObjectRecords,
    canSoftDeleteAllObjectRecords:
      recordsPermissions.canSoftDeleteAllObjectRecords,
    canDestroyAllObjectRecords: recordsPermissions.canDestroyAllObjectRecords,
    isEditable: true,
    canBeAssignedToUsers: roleManifest.canBeAssignedToUsers ?? true,
    canBeAssignedToAgents: roleManifest.canBeAssignedToAgents ?? true,
    canBeAssignedToApiKeys: roleManifest.canBeAssignedToApiKeys ?? true,
    canBeAssignedToApplications: false,
    roleTargetUniversalIdentifiers: [],
    objectPermissionUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    rowLevelPermissionRuleUniversalIdentifiers: [],
    rolePermissionFlagUniversalIdentifiers: [],
    rowLevelPermissionPredicateUniversalIdentifiers: [],
    agentChatChannelRoleUniversalIdentifiers: [],
    rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
  };
};
