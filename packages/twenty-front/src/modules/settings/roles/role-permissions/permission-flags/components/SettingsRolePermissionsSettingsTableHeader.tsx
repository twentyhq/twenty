import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Checkbox } from 'twenty-ui/input';

import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilState } from 'recoil';
import { v4 } from 'uuid';

type SettingsRolePermissionsSettingsTableHeaderProps = {
  roleId: string;
  settingsPermissionsConfig: SettingsRolePermissionsSettingPermission[];
  isEditable: boolean;
};

const StyledActionsHeader = styled(TableHeader)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsRolePermissionsSettingsTableHeader = ({
  roleId,
  settingsPermissionsConfig,
  isEditable,
}: SettingsRolePermissionsSettingsTableHeaderProps) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
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
      <StyledActionsHeader aria-label={t`Actions`}>
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
      </StyledActionsHeader>
    </TableRow>
  );
};
