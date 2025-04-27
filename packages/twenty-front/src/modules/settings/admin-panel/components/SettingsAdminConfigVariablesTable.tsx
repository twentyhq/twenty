import { SettingsAdminConfigVariablesRow } from '@/settings/admin-panel/components/SettingsAdminConfigVariablesRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useState } from 'react';
import { ConfigVariable } from '~/generated/graphql';

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

type SettingsAdminConfigVariablesTableProps = {
  variables: ConfigVariable[];
};

export const SettingsAdminConfigVariablesTable = ({
  variables,
}: SettingsAdminConfigVariablesTableProps) => {
  const [expandedRowName, setExpandedRowName] = useState<string | null>(null);

  const handleExpandToggle = (name: string) => {
    setExpandedRowName(expandedRowName === name ? null : name);
  };

  return (
    <Table>
      <TableRow gridAutoColumns="5fr 4fr 3fr 1fr">
        <TableHeader>Name</TableHeader>
        <TableHeader>Description</TableHeader>
        <TableHeader align="right">Value</TableHeader>
        <TableHeader align="right"></TableHeader>
      </TableRow>
      <StyledTableBody>
        {variables.map((variable) => (
          <SettingsAdminConfigVariablesRow
            key={variable.name}
            variable={variable}
            isExpanded={expandedRowName === variable.name}
            onExpandToggle={handleExpandToggle}
          />
        ))}
      </StyledTableBody>
    </Table>
  );
};
