import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isNonEmptyArray } from '@sniptt/guards';
import { produce } from 'immer';

export const getRoleWithRemovedFieldPermission = (
  role: RoleWithPartialMembers,
  fieldPermissionFieldMetadataId: string,
) => {
  return produce(role, (draftRole) => {
    if (!isNonEmptyArray(draftRole.fieldPermissions)) {
      return;
    }

    const indexOfExistingFieldPermission = draftRole.fieldPermissions.findIndex(
      (fieldPermissionToFind) =>
        fieldPermissionToFind.fieldMetadataId ===
        fieldPermissionFieldMetadataId,
    );

    if (indexOfExistingFieldPermission > -1) {
      draftRole.fieldPermissions.splice(indexOfExistingFieldPermission, 1);
    }

    return draftRole;
  });
};
