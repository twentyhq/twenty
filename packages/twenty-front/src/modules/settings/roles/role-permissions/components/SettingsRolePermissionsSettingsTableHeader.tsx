import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Checkbox } from 'twenty-ui';

const StyledNameHeader = styled(TableHeader)`
  flex: 1;
`;

const StyledTypeHeader = styled(TableHeader)`
  flex: 1;
`;

const StyledActionsHeader = styled(TableHeader)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(4)};
`;

type SettingsRolePermissionsSettingsTableHeaderProps = {
  allPermissions: boolean;
  onToggleAll?: () => void;
};

export const SettingsRolePermissionsSettingsTableHeader = ({
  allPermissions,
  onToggleAll,
}: SettingsRolePermissionsSettingsTableHeaderProps) => (
  <TableRow gridAutoColumns="3fr 4fr 24px">
    <StyledNameHeader>{t`Name`}</StyledNameHeader>
    <StyledTypeHeader>{t`Description`}</StyledTypeHeader>
    <StyledActionsHeader aria-label={t`Actions`}>
      <Checkbox
        checked={allPermissions}
        disabled={!onToggleAll}
        onChange={onToggleAll}
      />
    </StyledActionsHeader>
  </TableRow>
);
