import { SettingsAdminEnvVariablesRow } from '@/settings/admin-panel/components/SettingsAdminEnvVariablesRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

type SettingsAdminEnvVariablesTableProps = {
  variables: Array<{
    name: string;
    description: string;
    value: string;
    sensitive: boolean;
  }>;
};

export const SettingsAdminEnvVariablesTable = ({
  variables,
}: SettingsAdminEnvVariablesTableProps) => (
  <StyledTable>
    <TableRow gridAutoColumns="4fr 3fr 2fr 1fr 1fr">
      <TableHeader>Name</TableHeader>
      <TableHeader>Description</TableHeader>
      <TableHeader>Value</TableHeader>
      <TableHeader align="right"></TableHeader>
      <TableHeader align="right"></TableHeader>
    </TableRow>
    {variables.map((variable) => (
      <SettingsAdminEnvVariablesRow key={variable.name} variable={variable} />
    ))}
  </StyledTable>
);
