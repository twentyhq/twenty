import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { useObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useObjectPermissionDerivedStates';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

type SettingsRolePermissionsObjectLevelSeeFieldsValueForObjectProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const SettingsRolePermissionsObjectLevelSeeFieldsValueForObject = ({
  roleId,
  objectMetadataItem,
}: SettingsRolePermissionsObjectLevelSeeFieldsValueForObjectProps) => {
  const { t } = useLingui();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const objectMetadataItemId = objectMetadataItem.id;

  const restrictableFieldMetadataItems = objectMetadataItem.fields.filter(
    (fieldMetadataItem) => !isHiddenSystemField(fieldMetadataItem),
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
      (fieldPermission) =>
        isDefined(fieldPermission.canReadFieldValue) &&
        !fieldPermission.canReadFieldValue,
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
