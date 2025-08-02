import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { filterUserFacingFieldMetadataItems } from '@/object-metadata/utils/filterUserFacingFieldMetadataItems';
import { useObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useObjectPermissionDerivedStates';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

type SettingsRolePermissionsObjectLevelUpdateFieldsValueForObjectProps = {
  roleId: string;
  objectMetadataItemId: string;
};

export const SettingsRolePermissionsObjectLevelUpdateFieldsValueForObject = ({
  roleId,
  objectMetadataItemId,
}: SettingsRolePermissionsObjectLevelUpdateFieldsValueForObjectProps) => {
  const { t } = useLingui();

  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const restrictableFieldMetadataItems = objectMetadataItem.fields.filter(
    filterUserFacingFieldMetadataItems,
  );

  const numberOfRestrictableFieldMetadataItems =
    restrictableFieldMetadataItems.length;

  const roleFieldPermissions =
    settingsDraftRole.fieldPermissions?.filter(
      (fieldPermission) =>
        fieldPermission.objectMetadataId === objectMetadataItemId,
    ) ?? [];

  const numberOfRestrictedFieldMetadataItemsOnUpdate =
    roleFieldPermissions.filter(
      (fieldPermission) => fieldPermission.canUpdateFieldValue === false,
    ).length;

  const canUpdateSome =
    numberOfRestrictedFieldMetadataItemsOnUpdate > 0 &&
    numberOfRestrictedFieldMetadataItemsOnUpdate <
      numberOfRestrictableFieldMetadataItems;

  const canUpdateAll =
    roleFieldPermissions.length === 0 ||
    numberOfRestrictedFieldMetadataItemsOnUpdate === 0;

  const { objectUpdateIsRestricted } = useObjectPermissionDerivedStates({
    roleId,
    objectMetadataItemId,
  });

  return (
    <>
      {objectUpdateIsRestricted
        ? '-'
        : canUpdateAll
          ? t`All`
          : canUpdateSome
            ? t`Some`
            : t`No`}
    </>
  );
};
