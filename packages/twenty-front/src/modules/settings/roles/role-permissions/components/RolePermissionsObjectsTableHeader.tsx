import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Checkbox } from 'twenty-ui';

const StyledTableHeaderRow = styled(TableRow)`
  display: flex;
`;

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
  allPermissions: boolean;
};

export const RolePermissionsObjectsTableHeader = ({
  allPermissions,
}: RolePermissionsObjectsTableHeaderProps) => (
  <StyledTableHeaderRow>
    <StyledNameHeader>{t`Name`}</StyledNameHeader>
    <StyledActionsHeader aria-label={t`Actions`}>
      <Checkbox checked={allPermissions} disabled />
    </StyledActionsHeader>
  </StyledTableHeaderRow>
);
