import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { RolePermissionsObjectPermission } from '@/settings/roles/types/RolePermissionsObjectPermission';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import { Checkbox } from 'twenty-ui';

const StyledNameHeader = styled(TableHeader)`
  flex: 1;
`;

const StyledActionsHeader = styled(TableHeader)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(4)};
`;

type RolePermissionsObjectsTableHeaderProps = {
  roleId: string;
  objectPermissionsConfig: RolePermissionsObjectPermission[];
  isEditable: boolean;
};

export const RolePermissionsObjectsTableHeader = ({
  roleId,
  objectPermissionsConfig,
  isEditable,
}: RolePermissionsObjectsTableHeaderProps) => {
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
      <StyledNameHeader>{t`Name`}</StyledNameHeader>
      <StyledActionsHeader aria-label={t`Actions`}>
        <Checkbox
          checked={allPermissionsEnabled}
          indeterminate={somePermissionsEnabled && !allPermissionsEnabled}
          disabled={!isEditable}
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
