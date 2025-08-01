import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useObjectPermissionDerivedStates';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

type SettingsRolePermissionsObjectLevelSeeFieldsValueForObjectProps = {
  roleId: string;
  objectMetadataItemId: string;
};

export const SettingsRolePermissionsObjectLevelSeeFieldsValueForObject = ({
  roleId,
  objectMetadataItemId,
}: SettingsRolePermissionsObjectLevelSeeFieldsValueForObjectProps) => {
  const { t } = useLingui();

  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const restrictableFieldMetadataItems = objectMetadataItem.fields.filter(
    (fieldMetadataItem) => !fieldMetadataItem.isSystem,
  );

  const numberOfRestrictableFieldMetadataItemsOnRead =
    restrictableFieldMetadataItems.length;

  const roleFieldPermissions =
    settingsDraftRole.fieldPermissions?.filter(
      (fieldPermission) =>
        fieldPermission.objectMetadataId === objectMetadataItemId,
    ) ?? [];

  const numberOfRestrictedFieldMetadataItemsOnRead =
    roleFieldPermissions.filter(
      (fieldPermission) => fieldPermission.canReadFieldValue === false,
    ).length;

  const canReadSome =
    numberOfRestrictedFieldMetadataItemsOnRead > 0 &&
    numberOfRestrictedFieldMetadataItemsOnRead <
      numberOfRestrictableFieldMetadataItemsOnRead;

  const canReadAll =
    roleFieldPermissions.length === 0 ||
    numberOfRestrictedFieldMetadataItemsOnRead === 0;

  const { objectReadIsRestricted } = useObjectPermissionDerivedStates({
    roleId,
    objectMetadataItemId,
  });

  return (
    <>
      {objectReadIsRestricted
        ? '-'
        : canReadAll
          ? t`All`
          : canReadSome
            ? t`Some`
            : t`No`}
    </>
  );
};
