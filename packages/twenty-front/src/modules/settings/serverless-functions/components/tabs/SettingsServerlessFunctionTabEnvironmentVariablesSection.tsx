import dotenv from 'dotenv';
import { H2Title, IconPlus, IconSearch, MOBILE_VIEWPORT } from 'twenty-ui';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { Section } from '@/ui/layout/section/components/Section';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import React, { useState } from 'react';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { Button } from '@/ui/input/button/components/Button';
import { ServerlessFunctionFormValues } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { SettingsServerlessFunctionTabEnvironmentVariableTableRow } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTabEnvironmentVariableTableRow';

const StyledSearchInput = styled(TextInput)`
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

  const [searchTerm, setSearchTerm] = useState('');
  const [editModeIndex, setEditModeIndex] = useState<number | undefined>();
  const [envVariables, setEnvVariables] = useState<{ [key: string]: string }>(
    environmentVariables,
  );

  const getFormattedEnvironmentVariables = (newEnvVariables: {
    [key: string]: string;
  }) => {
    return Object.entries(newEnvVariables).reduce(
      (acc, [key, value]) =>
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
        <StyledTableBody>
          {Object.entries(envVariables).map(([key, value], index) => (
            <SettingsServerlessFunctionTabEnvironmentVariableTableRow
              key={index}
              index={index}
              envKey={key}
              envValue={value}
              initialEditMode={index === editModeIndex}
              onChange={(newKey, newValue) => {
                const newEnvVariables = Object.entries(envVariables).reduce(
                  (acc, [oldKey, oldValue], currentIndex) => {
                    if (index === currentIndex) {
                      acc[newKey] = newValue;
                    } else {
                      acc[oldKey] = oldValue;
                    }
                    return acc;
                  },
                  {} as { [key: string]: string },
                );
                setEnvVariables(newEnvVariables);
                onCodeChange(
                  '.env',
                  getFormattedEnvironmentVariables(newEnvVariables),
                );
              }}
              onDelete={() => {
                const newEnvVariables = { ...envVariables };
                delete newEnvVariables[key];
                setEnvVariables(newEnvVariables);
                onCodeChange(
                  '.env',
                  getFormattedEnvironmentVariables(newEnvVariables),
                );
              }}
            />
          ))}
        </StyledTableBody>
      </Table>
      <StyledButtonContainer>
        <Button
          Icon={IconPlus}
          title="Add Variable"
          size="small"
          variant="secondary"
          onClick={() => {
            setEnvVariables((prevState) => {
              return { ...prevState, '': '' };
            });
            setEditModeIndex(Object.keys(envVariables).length);
          }}
        />
      </StyledButtonContainer>
    </Section>
  );
};
