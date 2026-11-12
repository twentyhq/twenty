import { isSameFieldPermissionTarget } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/isSameFieldPermissionTarget';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isNonEmptyArray } from '@sniptt/guards';
import { produce } from 'immer';
import { type FieldPermission } from '~/generated-metadata/graphql';

export const getRoleWithRemovedFieldPermission = ({
  role,
  fieldPermissionToRemove,
}: {
  role: RoleWithPartialMembers;
  fieldPermissionToRemove: Pick<
    FieldPermission,
    'fieldMetadataId' | 'rowLevelPermissionPredicateGroupId'
  >;
}) => {
  return produce(role, (draftRole) => {
    if (!isNonEmptyArray(draftRole.fieldPermissions)) {
      return;
    }

    const indexOfExistingFieldPermission = draftRole.fieldPermissions.findIndex(
      (fieldPermissionToFind) =>
        isSameFieldPermissionTarget(
          fieldPermissionToFind,
          fieldPermissionToRemove,
        ),
    );

    if (indexOfExistingFieldPermission > -1) {
      draftRole.fieldPermissions.splice(indexOfExistingFieldPermission, 1);
    }

    return draftRole;
  });
};
