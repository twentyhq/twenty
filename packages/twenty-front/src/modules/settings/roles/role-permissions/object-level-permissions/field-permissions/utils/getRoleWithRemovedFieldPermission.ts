import { isNonEmptyArray } from '@sniptt/guards';
import { produce } from 'immer';
import { Role } from '~/generated/graphql';

export const getRoleWithRemovedFieldPermission = (
  role: Role,
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
