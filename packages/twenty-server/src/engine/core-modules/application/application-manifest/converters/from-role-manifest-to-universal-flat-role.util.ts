import { type NormalizedRoleManifest } from 'twenty-shared/application';

import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';

export const fromRoleManifestToUniversalFlatRole = ({
  roleManifest,
  applicationUniversalIdentifier,
  now,
}: {
  roleManifest: NormalizedRoleManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatRole => {
  const { recordsPermissions } = roleManifest;

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
    canReadAllObjectRecords: recordsPermissions.canReadAllRecords ?? false,
    canCreateAllObjectRecords:
      recordsPermissions.canCreateAllRecords ??
      recordsPermissions.canUpdateAllRecords ??
      false,
    canUpdateAllObjectRecords: recordsPermissions.canUpdateAllRecords ?? false,
    canSoftDeleteAllObjectRecords:
      recordsPermissions.canSoftDeleteAllRecords ?? false,
    canDestroyAllObjectRecords:
      recordsPermissions.canDestroyAllRecords ?? false,
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
