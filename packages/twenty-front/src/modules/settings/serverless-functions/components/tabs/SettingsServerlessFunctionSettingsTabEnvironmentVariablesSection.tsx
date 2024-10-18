import dotenv from 'dotenv';
import {
  H2Title,
  IconCheck,
  IconX,
  IconDotsVertical,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  MOBILE_VIEWPORT,
  isDefined,
} from 'twenty-ui';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { Section } from '@/ui/layout/section/components/Section';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import React, { useState } from 'react';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { Button } from '@/ui/input/button/components/Button';
import { ServerlessFunctionFormValues } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

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

const StyledEditModeTableRow = styled(TableRow)`
  grid-template-columns: 180px auto 56px;
`;

type EnvironmentVariable = {
  key: string;
  value: string;
  editMode?: boolean;
};

const EMPTY_ENV_VARIABLE: EnvironmentVariable = {
  key: '',
  value: '',
  editMode: true,
};

export const SettingsServerlessFunctionSettingsTabEnvironmentVariablesSection =
  ({
    formValues,
    onCodeChange,
  }: {
    formValues: ServerlessFunctionFormValues;
    onCodeChange: (filePath: string, value: string) => void;
  }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const parsedEnvironmentVariables = formValues.code?.['.env']
      ? dotenv.parse(formValues.code['.env'])
      : {};

    const environmentVariables = Object.keys(parsedEnvironmentVariables).map(
      (key) => {
        return { key, value: parsedEnvironmentVariables[key], editMode: false };
      },
    );

    const [envVariables, setEnvVariables] =
      useState<EnvironmentVariable[]>(environmentVariables);

    const tableRow = ({ key, value, editMode = false }: EnvironmentVariable) =>
      editMode ? (
        <StyledEditModeTableRow>
          <TableCell>
            <TextInputV2 autoFocus value={key} placeholder="Name" fullWidth />
          </TableCell>
          <TableCell>
            <TextInputV2 value={value} placeholder="Value" fullWidth />
          </TableCell>
          <TableCell>
            <LightIconButton
              accent={'tertiary'}
              Icon={IconX}
              onClick={() => {}}
            />
            <LightIconButton
              accent={'tertiary'}
              Icon={IconCheck}
              onClick={() => {}}
            />
          </TableCell>
        </StyledEditModeTableRow>
      ) : (
        <StyledTableRow>
          <TableCell>{key}</TableCell>
          <TableCell>{value}</TableCell>
          <TableCell>
            <Dropdown
              dropdownMenuWidth="100px"
              dropdownId={`${key}-settings-env-variable-dropdown`}
              clickableComponent={
                <LightIconButton
                  aria-label="Env Variable Options"
                  Icon={IconDotsVertical}
                  accent="tertiary"
                />
              }
              dropdownComponents={
                <DropdownMenu disableBlur disableBorder width="auto">
                  <DropdownMenuItemsContainer>
                    <MenuItem
                      text={'Edit'}
                      LeftIcon={IconPencil}
                      onClick={() =>
                        setEnvVariables((prevState) =>
                          prevState.reduce((acc, state) => {
                            if (state.key === key) {
                              acc.push({ ...state, editMode: true });
                              return acc;
                            } else if (state.key === '' && state.value === '') {
                              return acc;
                            } else {
                              acc.push({ ...state, editMode: false });
                              return acc;
                            }
                          }, [] as EnvironmentVariable[]),
                        )
                      }
                    />
                    <MenuItem
                      text={'Delete'}
                      LeftIcon={IconTrash}
                      onClick={() =>
                        setEnvVariables((prevState) =>
                          prevState.reduce((acc, state) => {
                            if (state.key !== key) {
                              acc.push({ ...state, editMode: true });
                              return acc;
                            }
                            return acc;
                          }, [] as EnvironmentVariable[]),
                        )
                      }
                    />
                  </DropdownMenuItemsContainer>
                </DropdownMenu>
              }
              dropdownHotkeyScope={{
                scope: `${key}-settings-env-variable-dropdown`,
              }}
            />
          </TableCell>
        </StyledTableRow>
      );

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
            {envVariables.map((environmentVariable) =>
              tableRow({
                key: environmentVariable.key,
                value: environmentVariable.value,
                editMode: environmentVariable.editMode,
              }),
            )}
          </StyledTableBody>
        </Table>
        <StyledButtonContainer>
          <Button
            Icon={IconPlus}
            title="Add Variable"
            size="small"
            disabled={isDefined(
              envVariables.find((envVariable) => envVariable.editMode),
            )}
            variant="secondary"
            onClick={() =>
              setEnvVariables((prevState) => {
                return [...prevState, EMPTY_ENV_VARIABLE];
              })
            }
          />
        </StyledButtonContainer>
      </Section>
    );
  };
