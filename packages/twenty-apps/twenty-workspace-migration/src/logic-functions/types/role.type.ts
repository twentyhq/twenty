export type ObjectPermission = {
  objectMetadataId: string;
  canReadObjectRecords: boolean | null;
  canUpdateObjectRecords: boolean | null;
  canSoftDeleteObjectRecords: boolean | null;
  canDestroyObjectRecords: boolean | null;
};

export type FieldPermission = {
  objectMetadataId: string;
  fieldMetadataId: string;
  canReadFieldValue: boolean | null;
  canUpdateFieldValue: boolean | null;
};

export type RolePermissionFlag = {
  flag: string;
};

export type Role = {
  id: string;
  label: string;
  description: string | null;
  icon: string | null;
  canUpdateAllSettings: boolean;
  canAccessAllTools: boolean;
  canReadAllObjectRecords: boolean;
  canUpdateAllObjectRecords: boolean;
  canSoftDeleteAllObjectRecords: boolean;
  canDestroyAllObjectRecords: boolean;
  canBeAssignedToUsers: boolean;
  canBeAssignedToAgents: boolean;
  canBeAssignedToApiKeys: boolean;
  permissionFlags: RolePermissionFlag[];
  objectPermissions: ObjectPermission[];
  fieldPermissions: FieldPermission[];
  // Only read to detect and warn about a non-empty source - not migrated by this tool.
  rowLevelPermissionPredicates: unknown[];
  rowLevelPermissionPredicateGroups: unknown[];
};
