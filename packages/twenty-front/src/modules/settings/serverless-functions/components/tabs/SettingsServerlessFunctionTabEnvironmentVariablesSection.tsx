import { SettingsServerlessFunctionTabEnvironmentVariableTableRow } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTabEnvironmentVariableTableRow';
import { ServerlessFunctionFormValues } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import dotenv from 'dotenv';
import { useMemo, useState } from 'react';
import { H2Title, IconPlus, IconSearch } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { v4 } from 'uuid';

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
  formValues,
  onCodeChange,
}: {
  formValues: ServerlessFunctionFormValues;
  onCodeChange: (filePath: string, value: string) => void;
}) => {
  const environmentVariables = formValues.code?.['.env']
    ? dotenv.parse(formValues.code['.env'])
    : {};
  const environmentVariablesList = Object.entries(environmentVariables).map(
    ([key, value]) => ({ id: v4(), key, value }),
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [newEnvVarAdded, setNewEnvVarAdded] = useState(false);
  const [envVariables, setEnvVariables] = useState<EnvironmentVariable[]>(
    environmentVariablesList,
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
    return newEnvVariables.reduce(
      (acc, { key, value }) =>
        key.length > 0 && value.length > 0 ? `${acc}\n${key}=${value}` : acc,
      '',
    );
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
                onChange={(newEnvVariable) => {
                  const newEnvVariables = envVariables.reduce(
                    (acc, { id, key }) => {
                      if (id === newEnvVariable.id) {
                        acc.push(newEnvVariable);
                      } else if (key !== newEnvVariable.key) {
                        acc.push(envVariable);
                      }
                      return acc;
                    },
                    [] as EnvironmentVariable[],
                  );
                  setEnvVariables(newEnvVariables);
                  onCodeChange(
                    '.env',
                    getFormattedEnvironmentVariables(newEnvVariables),
                  );
                }}
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
