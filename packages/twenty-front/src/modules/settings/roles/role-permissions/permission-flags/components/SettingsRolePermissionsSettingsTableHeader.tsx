import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';
import { Checkbox } from 'twenty-ui/input';

import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { v4 } from 'uuid';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsRolePermissionsSettingsTableHeaderProps = {
  roleId: string;
  settingsPermissionsConfig: SettingsRolePermissionsSettingPermission[];
  isEditable: boolean;
};

export const SettingsRolePermissionsSettingsTableHeader = ({
  roleId,
  settingsPermissionsConfig,
  isEditable,
}: SettingsRolePermissionsSettingsTableHeaderProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const allSettingsPermissionsEnabled = settingsPermissionsConfig.every(
    (permission) =>
      settingsDraftRole.permissionFlags?.some(
        (permissionFlag) => permissionFlag.flag === permission.key,
      ),
  );

  const someSettingsPermissionsEnabled = settingsPermissionsConfig.some(
    (permission) =>
      settingsDraftRole.permissionFlags?.some(
        (permissionFlag) => permissionFlag.flag === permission.key,
      ),
  );

  return (
    <TableRow gridAutoColumns="3fr 4fr 24px">
      <TableHeader>{t`Name`}</TableHeader>
      <TableHeader>{t`Description`}</TableHeader>
      <TableHeader
        align="right"
        padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
        aria-label={t`Actions`}
      >
        <Checkbox
          checked={allSettingsPermissionsEnabled}
          indeterminate={
            someSettingsPermissionsEnabled && !allSettingsPermissionsEnabled
          }
          disabled={!isEditable}
          aria-label={t`Toggle all settings permissions`}
          onChange={() => {
            const newValue = !allSettingsPermissionsEnabled;

            setSettingsDraftRole({
              ...settingsDraftRole,
              permissionFlags: newValue
                ? settingsPermissionsConfig.map((permission) => ({
                    id: v4(),
                    flag: permission.key,
                    roleId,
                  }))
                : [],
            });
          }}
        />
      </TableHeader>
    </TableRow>
  );
};
