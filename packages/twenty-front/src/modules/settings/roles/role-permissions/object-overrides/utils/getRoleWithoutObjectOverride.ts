import { getRoleWithUpsertedObjectPermission } from '@/settings/roles/role-permissions/object-overrides/utils/getRoleWithUpsertedObjectPermission';
import { getRoleWithoutRowLevelPermissionRules } from '@/settings/roles/role-permissions/object-overrides/utils/getRoleWithoutRowLevelPermissionRules';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

export const getRoleWithoutObjectOverride = ({
  role,
  objectMetadataId,
}: {
  role: RoleWithPartialMembers;
  objectMetadataId: string;
}): RoleWithPartialMembers => {
  const roleWithoutRules = getRoleWithoutRowLevelPermissionRules({
    role,
    shouldRemoveRule: (rule) => rule.objectMetadataId === objectMetadataId,
  });

  const roleWithResetObjectPermission = getRoleWithUpsertedObjectPermission(
    roleWithoutRules,
    {
      ...roleWithoutRules.objectPermissions?.find(
        (objectPermission) =>
          objectPermission.objectMetadataId === objectMetadataId,
      ),
      objectMetadataId,
      canReadObjectRecords: null,
      canUpdateObjectRecords: null,
      canSoftDeleteObjectRecords: null,
      canDestroyObjectRecords: null,
    },
  );

  return {
    ...roleWithResetObjectPermission,
    fieldPermissions: roleWithResetObjectPermission.fieldPermissions?.map(
      (fieldPermission) =>
        fieldPermission.objectMetadataId === objectMetadataId &&
        !isDefined(fieldPermission.rowLevelPermissionPredicateGroupId)
          ? {
              ...fieldPermission,
              canReadFieldValue: null,
              canUpdateFieldValue: null,
            }
          : fieldPermission,
    ),
  };
};
