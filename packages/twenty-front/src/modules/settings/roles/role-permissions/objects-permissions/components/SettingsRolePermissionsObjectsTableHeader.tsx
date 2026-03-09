import { type SettingsRolePermissionsObjectPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';
import { Checkbox } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsRolePermissionsObjectsTableHeaderProps = {
  roleId: string;
  objectPermissionsConfig: SettingsRolePermissionsObjectPermission[];
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectsTableHeader = ({
  roleId,
  objectPermissionsConfig,
  isEditable,
}: SettingsRolePermissionsObjectsTableHeaderProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const allPermissionsEnabled = objectPermissionsConfig.every(
    (permission) => permission.value,
  );

  const somePermissionsEnabled = objectPermissionsConfig.some(
    (permission) => permission.value,
  );

  return (
    <TableRow>
      <TableHeader>{t`All Objects`}</TableHeader>
      <TableHeader
        align="right"
        padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
        aria-label={t`Actions`}
      >
        <Checkbox
          checked={allPermissionsEnabled}
          indeterminate={somePermissionsEnabled && !allPermissionsEnabled}
          disabled={!isEditable}
          aria-label={t`Toggle all object permissions`}
          onChange={() => {
            const newValue = !allPermissionsEnabled;

            setSettingsDraftRole({
              ...settingsDraftRole,
              canReadAllObjectRecords: newValue,
              canUpdateAllObjectRecords: newValue,
              canSoftDeleteAllObjectRecords: newValue,
              canDestroyAllObjectRecords: newValue,
            });
          }}
        />
      </TableHeader>
    </TableRow>
  );
};
