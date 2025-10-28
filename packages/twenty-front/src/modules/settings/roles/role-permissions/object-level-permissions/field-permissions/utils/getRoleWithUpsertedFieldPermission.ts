import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isNonEmptyArray } from '@sniptt/guards';
import { produce } from 'immer';
import { type FieldPermission } from '~/generated/graphql';

export const getRoleWithUpsertedFieldPermission = (
  role: RoleWithPartialMembers,
  fieldPermissionToUpsert: FieldPermission,
) => {
  return produce(role, (draftRole) => {
    if (!isNonEmptyArray(draftRole.fieldPermissions)) {
      draftRole.fieldPermissions = [fieldPermissionToUpsert];

      return;
    }

    const indexOfExistingFieldPermission = draftRole.fieldPermissions.findIndex(
      (fieldPermissionToFind) =>
        fieldPermissionToFind.fieldMetadataId ===
        fieldPermissionToUpsert.fieldMetadataId,
    );

    if (indexOfExistingFieldPermission > -1) {
      draftRole.fieldPermissions[indexOfExistingFieldPermission] =
        fieldPermissionToUpsert;
    } else {
      draftRole.fieldPermissions.push(fieldPermissionToUpsert);
    }

    return draftRole;
  });
};
