import {
  type ObjectRecordsPermissionsManifest,
  type LegacyCompliantRoleManifest,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';

export type RoleChildrenManifests = Pick<
  LegacyCompliantRoleManifest,
  | 'rowLevelPermissionPredicateGroups'
  | 'rowLevelPermissionPredicates'
  | 'permissionFlagUniversalIdentifiers'
> & { objectsRecordsPermissions?: ObjectRecordsPermissionsManifest[] };

export const fromFlatRoleToLegacyCompliantRoleManifest = ({
  flatRole,
  children: {
    objectsRecordsPermissions,
    rowLevelPermissionPredicateGroups,
    rowLevelPermissionPredicates,
    permissionFlagUniversalIdentifiers,
  } = {},
}: {
  flatRole: UniversalFlatRole;
  children?: RoleChildrenManifests;
}): LegacyCompliantRoleManifest => ({
  universalIdentifier: flatRole.universalIdentifier,
  label: flatRole.label,
  ...(isDefined(flatRole.description)
    ? { description: flatRole.description }
    : {}),
  ...(isDefined(flatRole.icon) ? { icon: flatRole.icon } : {}),
  canUpdateAllSettings: flatRole.canUpdateAllSettings,
  canAccessAllTools: flatRole.canAccessAllTools,
  canAccessAllAgentChatChannels: flatRole.canAccessAllAgentChatChannels,
  canBeAssignedToUsers: flatRole.canBeAssignedToUsers,
  canBeAssignedToAgents: flatRole.canBeAssignedToAgents,
  canBeAssignedToApiKeys: flatRole.canBeAssignedToApiKeys,
  recordsPermissions: {
    canReadAllRecords: flatRole.canReadAllObjectRecords,
    canCreateAllRecords: flatRole.canCreateAllObjectRecords,
    canUpdateAllRecords: flatRole.canUpdateAllObjectRecords,
    canSoftDeleteAllRecords: flatRole.canSoftDeleteAllObjectRecords,
    canDestroyAllRecords: flatRole.canDestroyAllObjectRecords,
    ...(isNonEmptyArray(objectsRecordsPermissions)
      ? { objects: objectsRecordsPermissions }
      : {}),
  },
  ...(isNonEmptyArray(rowLevelPermissionPredicateGroups)
    ? { rowLevelPermissionPredicateGroups }
    : {}),
  ...(isNonEmptyArray(rowLevelPermissionPredicates)
    ? { rowLevelPermissionPredicates }
    : {}),
  ...(isNonEmptyArray(permissionFlagUniversalIdentifiers)
    ? { permissionFlagUniversalIdentifiers }
    : {}),
});
