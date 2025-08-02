import { isNonEmptyArray } from '@sniptt/guards';
import { produce } from 'immer';
import { FieldPermission, Role } from '~/generated/graphql';

export const getRoleWithUpsertedFieldPermission = (
  role: Role,
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
