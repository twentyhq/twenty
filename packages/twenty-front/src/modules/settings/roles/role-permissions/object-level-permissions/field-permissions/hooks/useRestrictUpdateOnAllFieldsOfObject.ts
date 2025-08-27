import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { filterUserFacingFieldMetadataItems } from '@/object-metadata/utils/filterUserFacingFieldMetadataItems';
import { useUpsertFieldPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useUpsertFieldPermissionInDraftRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useRestrictUpdateOnAllFieldsOfObject = ({
  roleId,
}: {
  roleId: string;
}) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const { upsertFieldPermissionInDraftRole } =
    useUpsertFieldPermissionInDraftRole(roleId);

  const restrictUpdateOnAllFieldsOfObject = (
    objectMetadataItem: ObjectMetadataItem,
  ) => {
    const existingFieldPermissionsForThisObject =
      settingsDraftRole.fieldPermissions?.filter(
        (fieldPermissionToFilter) =>
          fieldPermissionToFilter.objectMetadataId === objectMetadataItem.id,
      ) ?? [];

    const restrictableFieldMetadataItems = objectMetadataItem.fields.filter(
      filterUserFacingFieldMetadataItems,
    );

    const shouldCreateUpdatePermissionForAllFields =
      existingFieldPermissionsForThisObject.length === 0;

    if (shouldCreateUpdatePermissionForAllFields) {
      for (const fieldMetadataItem of restrictableFieldMetadataItems) {
        upsertFieldPermissionInDraftRole({
          fieldMetadataId: fieldMetadataItem.id,
          objectMetadataId: objectMetadataItem.id,
          canUpdateFieldValue: false,
          canReadFieldValue: null,
          id: v4(),
          roleId,
        });
      }
    } else {
      for (const fieldMetadataItem of restrictableFieldMetadataItems) {
        const alreadyExistingFieldPermission =
          existingFieldPermissionsForThisObject.find(
            (fieldPermissionToFind) =>
              fieldPermissionToFind.fieldMetadataId === fieldMetadataItem.id,
          );

        if (isDefined(alreadyExistingFieldPermission)) {
          upsertFieldPermissionInDraftRole({
            ...alreadyExistingFieldPermission,
            canUpdateFieldValue: false,
          });
        } else {
          upsertFieldPermissionInDraftRole({
            fieldMetadataId: fieldMetadataItem.id,
            objectMetadataId: objectMetadataItem.id,
            canUpdateFieldValue: false,
            canReadFieldValue: null,
            id: v4(),
            roleId,
          });
        }
      }
    }
  };

  return {
    restrictUpdateOnAllFieldsOfObject,
  };
};
