import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { filterUserFacingFieldMetadataItems } from '@/object-metadata/utils/filterUserFacingFieldMetadataItems';
import { useUpsertFieldPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useUpsertFieldPermissionInDraftRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useRestrictReadOnAllFieldsOfObject = ({
  roleId,
}: {
  roleId: string;
}) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const { upsertFieldPermissionInDraftRole } =
    useUpsertFieldPermissionInDraftRole(roleId);

  const restrictReadOnAllFieldsOfObject = (
    objectMetadataItem: ObjectMetadataItem,
  ) => {
    const restrictableFieldMetadataItems = objectMetadataItem.fields.filter(
      filterUserFacingFieldMetadataItems,
    );

    const existingFieldPermissionsForThisObject =
      settingsDraftRole.fieldPermissions?.filter(
        (fieldPermissionToFilter) =>
          fieldPermissionToFilter.objectMetadataId === objectMetadataItem.id,
      ) ?? [];

    if (existingFieldPermissionsForThisObject.length === 0) {
      for (const fieldMetadataItem of restrictableFieldMetadataItems) {
        upsertFieldPermissionInDraftRole({
          fieldMetadataId: fieldMetadataItem.id,
          objectMetadataId: objectMetadataItem.id,
          canUpdateFieldValue: false,
          canReadFieldValue: false,
          id: v4(),
          roleId,
        });
      }
    } else {
      for (const fieldMetadataItem of restrictableFieldMetadataItems) {
        const foundFieldPermission = existingFieldPermissionsForThisObject.find(
          (fieldPermissionToFind) =>
            fieldPermissionToFind.fieldMetadataId === fieldMetadataItem.id,
        );

        if (isDefined(foundFieldPermission)) {
          upsertFieldPermissionInDraftRole({
            ...foundFieldPermission,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          });
        } else {
          upsertFieldPermissionInDraftRole({
            fieldMetadataId: fieldMetadataItem.id,
            objectMetadataId: objectMetadataItem.id,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
            id: v4(),
            roleId,
          });
        }
      }
    }
  };

  return {
    restrictReadOnAllFieldsOfObject,
  };
};
