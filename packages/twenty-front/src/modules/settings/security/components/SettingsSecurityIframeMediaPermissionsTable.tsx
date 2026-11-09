import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsSecurityIframeMediaPermissionRow } from '@/settings/security/components/SettingsSecurityIframeMediaPermissionRow';
import { IFRAME_MEDIA_PERMISSIONS_TABLE_GRID_AUTO_COLUMNS } from '@/settings/security/constants/IframeMediaPermissionsTableGridAutoColumns';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsSecurityIframeMediaPermissionsTableProps = {
  disabled: boolean;
  permissions: IframeMediaPermission[];
};

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

export const SettingsSecurityIframeMediaPermissionsTable = ({
  disabled,
  permissions,
}: SettingsSecurityIframeMediaPermissionsTableProps) => {
  const { t } = useLingui();

  if (!isNonEmptyArray(permissions)) {
    return null;
  }

  return (
    <Table>
      <TableRow
        gridAutoColumns={IFRAME_MEDIA_PERMISSIONS_TABLE_GRID_AUTO_COLUMNS}
      >
        <TableHeader>{t`Website`}</TableHeader>
        <TableHeader>{t`Access`}</TableHeader>
        <TableHeader />
      </TableRow>
      <StyledTableBodyContainer>
        <TableBody>
          {permissions.map((permission) => (
            <SettingsSecurityIframeMediaPermissionRow
              key={permission.origin}
              permission={permission}
              disabled={disabled}
            />
          ))}
        </TableBody>
      </StyledTableBodyContainer>
    </Table>
  );
};
