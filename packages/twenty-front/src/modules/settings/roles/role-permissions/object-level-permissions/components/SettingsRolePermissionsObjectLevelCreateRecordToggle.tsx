import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useUpsertObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useUpsertObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { t } from '@lingui/core/macro';
import { Toggle } from 'twenty-ui/input';
import { type ObjectPermission } from '~/generated-metadata/graphql';

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
  ) as
    | (ObjectPermission & { canCreateObjectRecords?: boolean | null })
    | undefined;

  const { upsertObjectPermission } = useUpsertObjectPermission({ roleId });

  const isCreatable = objectPermission?.canCreateObjectRecords ?? true;
  const isDisabled = !isEditable || !objectMetadataItem.isUICreatable;

  const handleToggle = (newValue: boolean) => {
    if (isDisabled) {
      return;
    }
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
