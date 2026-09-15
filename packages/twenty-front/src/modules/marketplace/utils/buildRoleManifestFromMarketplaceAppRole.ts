import { type RoleManifest } from 'twenty-shared/application';
import { type MarketplaceAppRole } from '~/generated-metadata/graphql';

export const buildRoleManifestFromMarketplaceAppRole = (
  role: MarketplaceAppRole,
): RoleManifest => ({
  universalIdentifier: role.universalIdentifier,
  label: role.label,
  description: role.description ?? undefined,
  icon: role.icon ?? undefined,
  canUpdateAllSettings: role.canUpdateAllSettings ?? undefined,
  canAccessAllTools: role.canAccessAllTools ?? undefined,
  canReadAllObjectRecords: role.canReadAllObjectRecords ?? undefined,
  canUpdateAllObjectRecords: role.canUpdateAllObjectRecords ?? undefined,
  canSoftDeleteAllObjectRecords:
    role.canSoftDeleteAllObjectRecords ?? undefined,
  canDestroyAllObjectRecords: role.canDestroyAllObjectRecords ?? undefined,
  permissionFlagUniversalIdentifiers:
    role.permissionFlagUniversalIdentifiers ?? undefined,
  objectPermissions: role.objectPermissions?.map((permission) => ({
    universalIdentifier: permission.universalIdentifier,
    objectUniversalIdentifier: permission.objectUniversalIdentifier,
    canReadObjectRecords: permission.canReadObjectRecords ?? undefined,
    canUpdateObjectRecords: permission.canUpdateObjectRecords ?? undefined,
    canSoftDeleteObjectRecords:
      permission.canSoftDeleteObjectRecords ?? undefined,
    canDestroyObjectRecords: permission.canDestroyObjectRecords ?? undefined,
  })),
  fieldPermissions: role.fieldPermissions?.map((permission) => ({
    universalIdentifier: permission.universalIdentifier,
    objectUniversalIdentifier: permission.objectUniversalIdentifier,
    fieldUniversalIdentifier: permission.fieldUniversalIdentifier,
    canReadFieldValue: permission.canReadFieldValue ?? undefined,
    canUpdateFieldValue: permission.canUpdateFieldValue ?? undefined,
  })),
});
