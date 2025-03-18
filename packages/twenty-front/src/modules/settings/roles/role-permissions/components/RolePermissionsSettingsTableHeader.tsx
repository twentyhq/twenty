import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Checkbox } from 'twenty-ui';

const StyledTableHeaderRow = styled(TableRow)`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(8)};
`;

const StyledNameHeader = styled(TableHeader)`
  flex: 1;
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledActionsHeader = styled(TableHeader)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(4)};
`;

const StyledTypeHeader = styled(TableHeader)`
  flex: 1;
`;

type RolePermissionsSettingsTableHeaderProps = {
  allPermissions: boolean;
};

export const RolePermissionsSettingsTableHeader = ({
  allPermissions,
}: RolePermissionsSettingsTableHeaderProps) => (
  <StyledTableHeaderRow>
    <StyledNameHeader>{t`Name`}</StyledNameHeader>
    <StyledTypeHeader>{t`Type`}</StyledTypeHeader>
    <StyledActionsHeader aria-label={t`Actions`}>
      <Checkbox checked={allPermissions} disabled />
    </StyledActionsHeader>
  </StyledTableHeaderRow>
);
