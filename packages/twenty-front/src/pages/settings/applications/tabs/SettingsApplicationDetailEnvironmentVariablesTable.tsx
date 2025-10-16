import { Section } from 'twenty-ui/layout';
import { H2Title, IconSearch } from 'twenty-ui/display';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useMemo, useState } from 'react';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import styled from '@emotion/styled';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import {
  type EnvironmentVariable,
  SettingsApplicationDetailEnvironmentVariablesTableRow,
  StyledApplicationEnvironmentVariableTableRow,
} from '~/pages/settings/applications/tabs/SettingsApplicationDetailEnvironmentVariablesTableRow';

const StyledSearchInput = styled(SettingsTextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const SettingsApplicationDetailEnvironmentVariablesTable = ({
  envVariables,
  onUpdate,
  readonly,
}: {
  envVariables: EnvironmentVariable[];
  onUpdate: (newEnv: Pick<EnvironmentVariable, 'key' | 'value'>) => void;
  readonly?: boolean;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredEnvVariable = useMemo(() => {
    return envVariables.filter(
      ({ key, value }) =>
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        value.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [envVariables, searchTerm]);

  return (
    <Section>
      <H2Title
        title="Configuration"
        description="Set your application configuration variables"
      />
      <StyledSearchInput
        instanceId="env-var-search"
        LeftIcon={IconSearch}
        placeholder="Search a variable"
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <Table>
        <StyledApplicationEnvironmentVariableTableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Value</TableHeader>
          <TableHeader>Info</TableHeader>
          <TableHeader></TableHeader>
        </StyledApplicationEnvironmentVariableTableRow>
        {filteredEnvVariable.length > 0 && (
          <StyledTableBody>
            {filteredEnvVariable.map((envVariable) => (
              <SettingsApplicationDetailEnvironmentVariablesTableRow
                key={envVariable.id}
                envVariable={envVariable}
                onChange={onUpdate}
                readonly={readonly}
              />
            ))}
          </StyledTableBody>
        )}
      </Table>
    </Section>
  );
};
