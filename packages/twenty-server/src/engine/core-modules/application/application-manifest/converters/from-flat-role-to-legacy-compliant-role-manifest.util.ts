import { type LegacyCompliantRoleManifest } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';

export type RoleChildrenManifests = Pick<
  LegacyCompliantRoleManifest,
  | 'objectPermissions'
  | 'fieldPermissions'
  | 'rowLevelPermissionPredicateGroups'
  | 'rowLevelPermissionPredicates'
  | 'permissionFlagUniversalIdentifiers'
>;

const withoutEmptyCollections = ({
  objectPermissions,
  fieldPermissions,
  rowLevelPermissionPredicateGroups,
  rowLevelPermissionPredicates,
  permissionFlagUniversalIdentifiers,
}: RoleChildrenManifests): RoleChildrenManifests => ({
  ...(isNonEmptyArray(objectPermissions) ? { objectPermissions } : {}),
  ...(isNonEmptyArray(fieldPermissions) ? { fieldPermissions } : {}),
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

export const fromFlatRoleToLegacyCompliantRoleManifest = ({
  flatRole,
  children = {},
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
  canReadAllObjectRecords: flatRole.canReadAllObjectRecords,
  canUpdateAllObjectRecords: flatRole.canUpdateAllObjectRecords,
  canSoftDeleteAllObjectRecords: flatRole.canSoftDeleteAllObjectRecords,
  canDestroyAllObjectRecords: flatRole.canDestroyAllObjectRecords,
  canBeAssignedToUsers: flatRole.canBeAssignedToUsers,
  canBeAssignedToAgents: flatRole.canBeAssignedToAgents,
  canBeAssignedToApiKeys: flatRole.canBeAssignedToApiKeys,
  ...withoutEmptyCollections(children),
});
