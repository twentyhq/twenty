import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsSecurityOriginTableCell } from '@/settings/security/components/SettingsSecurityOriginTableCell';
import { IFRAME_ORIGINS_TABLE_GRID_AUTO_COLUMNS } from '@/settings/security/constants/IframeOriginsTableGridAutoColumns';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsSecurityIframeOriginsTableProps = {
  disabled: boolean;
  origins: string[];
  onRemove: (origin: string) => void;
};

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

export const SettingsSecurityIframeOriginsTable = ({
  disabled,
  origins,
  onRemove,
}: SettingsSecurityIframeOriginsTableProps) => {
  const { t } = useLingui();

  if (!isNonEmptyArray(origins)) {
    return null;
  }

  return (
    <Table>
      <TableRow gridAutoColumns={IFRAME_ORIGINS_TABLE_GRID_AUTO_COLUMNS}>
        <TableHeader>{t`Website`}</TableHeader>
        <TableHeader />
      </TableRow>
      <StyledTableBodyContainer>
        <TableBody>
          {origins.map((origin) => (
            <TableRow
              key={origin}
              gridAutoColumns={IFRAME_ORIGINS_TABLE_GRID_AUTO_COLUMNS}
            >
              <SettingsSecurityOriginTableCell origin={origin} />
              <TableCell align="right">
                <IconButton
                  aria-label={t`Remove ${origin}`}
                  disabled={disabled}
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(origin)}
                >
                  <IconX />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTableBodyContainer>
    </Table>
  );
};
