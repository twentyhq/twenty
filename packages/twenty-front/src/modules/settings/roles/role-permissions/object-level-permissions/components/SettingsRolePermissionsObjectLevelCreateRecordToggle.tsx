import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useUpsertObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useUpsertObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { t } from '@lingui/core/macro';
import { Toggle } from 'twenty-ui/input';

type SettingsRolePermissionsObjectLevelCreateRecordToggleProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  isEditable?: boolean;
};

export const SettingsRolePermissionsObjectLevelCreateRecordToggle = ({
  roleId,
  objectMetadataItem,
  isEditable = true,
}: SettingsRolePermissionsObjectLevelCreateRecordToggleProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const objectPermission = settingsDraftRole.objectPermissions?.find(
    (permission) => permission.objectMetadataId === objectMetadataItem.id,
  );

  const { upsertObjectPermission } = useUpsertObjectPermission({ roleId });

  const isCreatable = objectPermission?.canCreateObjectRecords !== false;
  const isDisabled = !isEditable || !objectMetadataItem.isUICreatable;

  const handleToggle = (newValue: boolean) => {
    if (isDisabled) return;
    upsertObjectPermission(
      objectMetadataItem.id,
      'canCreateObjectRecords',
      newValue,
    );
  };

  return (
    <Toggle
      value={isCreatable}
      onChange={handleToggle}
      disabled={isDisabled}
      toggleSize="small"
      aria-label={t`Toggle create records for ${objectMetadataItem.labelPlural}`}
    />
  );
};
