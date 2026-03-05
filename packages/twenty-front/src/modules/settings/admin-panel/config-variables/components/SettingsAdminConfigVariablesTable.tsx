import { t } from '@lingui/core/macro';
import { SettingsAdminConfigVariablesRow } from '@/settings/admin-panel/config-variables/components/SettingsAdminConfigVariablesRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type ConfigVariable } from '~/generated-metadata/graphql';

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

type SettingsAdminConfigVariablesTableProps = {
  variables: ConfigVariable[];
};

export const SettingsAdminConfigVariablesTable = ({
  variables,
}: SettingsAdminConfigVariablesTableProps) => {
  return (
    <Table>
      <TableRow gridAutoColumns="5fr 3fr 1fr">
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader align="right">{t`Value`}</TableHeader>
        <TableHeader align="right"></TableHeader>
      </TableRow>
      <StyledTableBodyContainer>
        <TableBody>
          {variables.map((variable) => (
            <SettingsAdminConfigVariablesRow
              key={variable.name}
              variable={variable}
            />
          ))}
        </TableBody>
      </StyledTableBodyContainer>
    </Table>
  );
};
