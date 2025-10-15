import { SettingsServerlessFunctionTabEnvironmentVariableTableRow } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTabEnvironmentVariableTableRow';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { H2Title, IconPlus, IconSearch } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { v4 } from 'uuid';
import { serverlessFunctionEnvVarFamilyState } from '@/settings/serverless-functions/states/serverlessFunctionEnvVarFamilyState';
import { useRecoilState } from 'recoil';

const StyledSearchInput = styled(SettingsTextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-top: ${({ theme }) => theme.spacing(5)};
  }
`;

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 180px auto 32px;
`;

export type EnvironmentVariable = { id: string; key: string; value: string };

export const SettingsServerlessFunctionTabEnvironmentVariablesSection = ({
  onCodeChange,
  serverlessFunctionId,
}: {
  serverlessFunctionId: string;
  onCodeChange: (filePath: string, value: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newEnvVarAdded, setNewEnvVarAdded] = useState(false);
  const [envVariables, setEnvVariables] = useRecoilState(
    serverlessFunctionEnvVarFamilyState(serverlessFunctionId),
  );

  const filteredEnvVariable = useMemo(() => {
    return envVariables.filter(
      ({ key, value }) =>
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        value.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [envVariables, searchTerm]);

  const getFormattedEnvironmentVariables = (
    newEnvVariables: EnvironmentVariable[],
  ) => {
    return [...newEnvVariables]
      .reverse()
      .reduce(
        (acc, { key, value }) =>
          key.length > 0 && value.length > 0 ? `${key}=${value}\n${acc}` : acc,
        '',
      );
  };

  const onEnvVarChange = (newEnvVariable: EnvironmentVariable) => {
    const newEnvVariables: EnvironmentVariable[] = [];

    for (const envVariable of envVariables) {
      if (envVariable.id === newEnvVariable.id) {
        newEnvVariables.push(newEnvVariable);
      } else if (envVariable.key !== newEnvVariable.key) {
        newEnvVariables.push(envVariable);
      }
    }

    setEnvVariables(newEnvVariables);
    onCodeChange('.env', getFormattedEnvironmentVariables(newEnvVariables));
  };

  return (
    <Section>
      <H2Title
        title="Environment variables"
        description="Set your function environment variables"
      />
      <StyledSearchInput
        instanceId="serverless-function-env-var-search"
        LeftIcon={IconSearch}
        placeholder="Search a variable"
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <Table>
        <StyledTableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Value</TableHeader>
          <TableHeader></TableHeader>
        </StyledTableRow>
        {filteredEnvVariable.length > 0 && (
          <StyledTableBody>
            {filteredEnvVariable.map((envVariable) => (
              <SettingsServerlessFunctionTabEnvironmentVariableTableRow
                key={envVariable.id}
                envVariable={envVariable}
                initialEditMode={newEnvVarAdded && envVariable.value === ''}
                onChange={onEnvVarChange}
                onDelete={() => {
                  const newEnvVariables = envVariables.filter(
                    ({ id }) => id !== envVariable.id,
                  );
                  setEnvVariables(newEnvVariables);
                  onCodeChange(
                    '.env',
                    getFormattedEnvironmentVariables(newEnvVariables),
                  );
                }}
              />
            ))}
          </StyledTableBody>
        )}
      </Table>
      <StyledButtonContainer>
        <Button
          Icon={IconPlus}
          title="Add Variable"
          size="small"
          variant="secondary"
          onClick={() => {
            setEnvVariables((prevState) => {
              return [...prevState, { id: v4(), key: '', value: '' }];
            });
            setNewEnvVarAdded(true);
          }}
        />
      </StyledButtonContainer>
    </Section>
  );
};
