export type DeprecatedObjectPermissionsWithRestrictedFields = {
  canDestroyObjectRecords: boolean;
  canReadObjectRecords: boolean;
  canSoftDeleteObjectRecords: boolean;
  canUpdateObjectRecords: boolean;
  restrictedFields?: Record<
    string,
    { canRead: boolean | null; canUpdate: boolean | null }
  >;
};
