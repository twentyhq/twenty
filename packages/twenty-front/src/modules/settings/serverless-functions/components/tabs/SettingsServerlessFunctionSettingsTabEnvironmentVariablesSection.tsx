import dotenv from 'dotenv';
import {
  H2Title,
  IconPlus,
  IconSearch,
  MOBILE_VIEWPORT,
} from 'packages/twenty-ui';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Section } from '@/ui/layout/section/components/Section';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useState } from 'react';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useGetOneServerlessFunctionSourceCode } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode';
import { useParams } from 'react-router-dom';
import { Button } from '@/ui/input/button/components/Button';
import {
  ServerlessFunctionFormValues,
  ServerlessFunctionNewFormValues,
} from 'packages/twenty-front/src/modules/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';

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

export const SettingsServerlessFunctionSettingsTabEnvironmentVariablesSection =
  ({
    formValues,
    onChange,
  }: {
    formValues: ServerlessFunctionFormValues;
    onChange: (key: string) => (value: string) => void;
  }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const environmentVariables = formValues.code?.['.env']
      ? dotenv.parse(formValues.code['.env'])
      : {};

    console.log(environmentVariables);

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
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Value</TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
          <StyledTableBody>
            {Object.keys(environmentVariables).map((key) => (
              <TableRow>
                <TableCell>{key}</TableCell>
                <TableCell>{environmentVariables[key]}</TableCell>
              </TableRow>
            ))}
          </StyledTableBody>
        </Table>
        <StyledButtonContainer>
          <Button
            Icon={IconPlus}
            title="Add Variable"
            size="small"
            variant="secondary"
            onClick={() => console.log('toto')}
          />
        </StyledButtonContainer>
      </Section>
    );
  };
