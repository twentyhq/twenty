import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useUpsertFieldPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useUpsertFieldPermissionInDraftRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilValue } from 'recoil';

export const useRemoveReadOverrideOnAllFieldsOfObject = ({
  roleId,
}: {
  roleId: string;
}) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const { upsertFieldPermissionInDraftRole } =
    useUpsertFieldPermissionInDraftRole(roleId);

  const removeReadOverrideOnAllFieldsOfObject = (
    objectMetadataItem: ObjectMetadataItem,
  ) => {
    const existingFieldPermissionsForThisObject =
      settingsDraftRole.fieldPermissions?.filter(
        (fieldPermissionToFilter) =>
          fieldPermissionToFilter.objectMetadataId === objectMetadataItem.id,
      ) ?? [];

    for (const fieldPermissionToChange of existingFieldPermissionsForThisObject) {
      upsertFieldPermissionInDraftRole({
        ...fieldPermissionToChange,
        canReadFieldValue: null,
      });
    }
  };

  return {
    removeReadOverrideOnAllFieldsOfObject,
  };
};
