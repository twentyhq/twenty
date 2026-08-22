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

export type RowLevelPermissionPredicate = {
  id: string;
  fieldMetadataId: string;
  objectMetadataId: string;
  operand: string;
  value: unknown;
  subFieldName: string | null;
  workspaceMemberFieldMetadataId: string | null;
  workspaceMemberSubFieldName: string | null;
  rowLevelPermissionPredicateGroupId: string | null;
  positionInRowLevelPermissionPredicateGroup: number | null;
};

export type RowLevelPermissionPredicateGroup = {
  id: string;
  parentRowLevelPermissionPredicateGroupId: string | null;
  logicalOperator: string;
  positionInRowLevelPermissionPredicateGroup: number | null;
  objectMetadataId: string;
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
  // Enterprise-only feature
  rowLevelPermissionPredicates: RowLevelPermissionPredicate[];
  rowLevelPermissionPredicateGroups: RowLevelPermissionPredicateGroup[];
};
