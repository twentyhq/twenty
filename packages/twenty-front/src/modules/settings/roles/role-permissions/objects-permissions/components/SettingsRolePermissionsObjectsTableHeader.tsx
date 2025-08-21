import { type SettingsRolePermissionsObjectPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import { Checkbox } from 'twenty-ui/input';

const StyledNameHeader = styled(TableHeader)`
  flex: 1;
`;

const StyledActionsHeader = styled(TableHeader)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

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
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const allPermissionsEnabled = objectPermissionsConfig.every(
    (permission) => permission.value,
  );

  const somePermissionsEnabled = objectPermissionsConfig.some(
    (permission) => permission.value,
  );

  return (
    <TableRow>
      <StyledNameHeader>{t`All Objects`}</StyledNameHeader>
      <StyledActionsHeader aria-label={t`Actions`}>
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
      </StyledActionsHeader>
    </TableRow>
  );
};
