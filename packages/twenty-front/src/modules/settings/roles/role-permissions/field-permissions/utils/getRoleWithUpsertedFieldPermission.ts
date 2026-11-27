import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isNonEmptyArray } from '@sniptt/guards';
import { produce } from 'immer';
import { isDefined } from 'twenty-shared/utils';
import { type FieldPermission } from '~/generated-metadata/graphql';

export const getRoleWithUpsertedFieldPermission = (
  role: RoleWithPartialMembers,
  fieldPermissionToUpsert: FieldPermission,
) => {
  const fieldPermissionsKey = isDefined(
    fieldPermissionToUpsert.rowLevelPermissionPredicateGroupId,
  )
    ? 'rowLevelPermissionFieldPermissions'
    : 'fieldPermissions';

  return produce(role, (draftRole) => {
    const fieldPermissions = draftRole[fieldPermissionsKey];

    if (!isNonEmptyArray(fieldPermissions)) {
      draftRole[fieldPermissionsKey] = [fieldPermissionToUpsert];

      return;
    }

    const indexOfExistingFieldPermission = fieldPermissions.findIndex(
      (fieldPermissionToFind) =>
        fieldPermissionToFind.fieldMetadataId ===
          fieldPermissionToUpsert.fieldMetadataId &&
        (fieldPermissionToFind.rowLevelPermissionPredicateGroupId ?? null) ===
          (fieldPermissionToUpsert.rowLevelPermissionPredicateGroupId ?? null),
    );

    if (indexOfExistingFieldPermission > -1) {
      fieldPermissions[indexOfExistingFieldPermission] =
        fieldPermissionToUpsert;
    } else {
      fieldPermissions.push(fieldPermissionToUpsert);
    }

    return draftRole;
  });
};
