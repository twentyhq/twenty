import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

export const APP_PREFERENCES_APPS_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) auto 28px';

const StyledRows = styled.div`
  padding: ${themeCssVariables.spacing[2]} 0;
`;

type SettingsAppPreferencesAppsTableProps = {
  children?: ReactNode;
};

export const SettingsAppPreferencesAppsTable = ({
  children,
}: SettingsAppPreferencesAppsTableProps) => (
  <Table>
    <TableRow gridTemplateColumns={APP_PREFERENCES_APPS_GRID_TEMPLATE_COLUMNS}>
      <TableHeader>
        <Trans>App</Trans>
      </TableHeader>
      <TableHeader align="right">
        <Trans>Type</Trans>
      </TableHeader>
      <TableHeader />
    </TableRow>
    <StyledRows>{children}</StyledRows>
  </Table>
);
