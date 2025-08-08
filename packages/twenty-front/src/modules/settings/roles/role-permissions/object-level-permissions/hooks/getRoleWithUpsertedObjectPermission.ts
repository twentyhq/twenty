import { isNonEmptyArray } from '@sniptt/guards';
import { produce } from 'immer';
import { ObjectPermission, Role } from '~/generated/graphql';

export const getRoleWithUpsertedObjectPermission = (
  role: Role,
  objectPermissionToUpsert: ObjectPermission,
) => {
  return produce(role, (draftRole) => {
    if (!isNonEmptyArray(draftRole.objectPermissions)) {
      draftRole.objectPermissions = [objectPermissionToUpsert];

      return;
    }

    const indexOfExistingObjectPermission =
      draftRole.objectPermissions.findIndex(
        (objectPermissionToFind) =>
          objectPermissionToFind.objectMetadataId ===
          objectPermissionToUpsert.objectMetadataId,
      );

    if (indexOfExistingObjectPermission > -1) {
      draftRole.objectPermissions[indexOfExistingObjectPermission] =
        objectPermissionToUpsert;
    } else {
      draftRole.objectPermissions.push(objectPermissionToUpsert);
    }

    return draftRole;
  });
};
