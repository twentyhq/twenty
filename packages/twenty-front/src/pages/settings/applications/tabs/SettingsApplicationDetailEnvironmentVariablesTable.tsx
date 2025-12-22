import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { H2Title, IconSearch } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
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
        title={t`Configuration`}
        description={t`Set your application configuration variables`}
      />
      <StyledSearchInput
        instanceId="env-var-search"
        LeftIcon={IconSearch}
        placeholder={t`Search a variable`}
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <Table>
        <StyledApplicationEnvironmentVariableTableRow>
          <TableHeader>{t`Name`}</TableHeader>
          <TableHeader>{t`Value`}</TableHeader>
          <TableHeader>{t`Info`}</TableHeader>
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
