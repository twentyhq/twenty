import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import {
  IconCheck,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconX,
} from 'twenty-ui';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

const StyledEditModeTableRow = styled(TableRow)`
  grid-template-columns: 180px auto 56px;
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 180px auto 32px;
`;

export const SettingsServerlessFunctionSettingsTabEnvironmentVariableTableRow =
  ({
    envKey,
    envValue,
    onChange,
    onDelete,
    index,
    editMode,
    setEditMode,
  }: {
    envKey: string;
    envValue: string;
    onChange: (newKey: string, newValue: string) => void;
    onDelete: () => void;
    index: number;
    editMode: boolean;
    setEditMode: (newEditMode: boolean) => void;
  }) => {
    const [editedEnvKey, setEditedEnvKey] = useState<string>(envKey);
    const [editedEnvValue, setEditedEnvValue] = useState<string>(envValue);
    const dropDownId = `settings-environment-variable-dropdown-${index}`;
    const { closeDropdown } = useDropdown(dropDownId);

    if (editMode) {
      closeDropdown();
    }

    return editMode ? (
      <StyledEditModeTableRow>
        <TableCell>
          <TextInputV2
            autoFocus
            value={editedEnvKey}
            onChange={setEditedEnvKey}
            placeholder="Name"
            fullWidth
          />
        </TableCell>
        <TableCell>
          <TextInputV2
            value={editedEnvValue}
            onChange={setEditedEnvValue}
            placeholder="Value"
            fullWidth
          />
        </TableCell>
        <TableCell>
          <LightIconButton
            accent={'tertiary'}
            Icon={IconX}
            onClick={() => {
              if (editedEnvKey === '' && editedEnvValue === '') {
                onDelete();
              }
              setEditedEnvKey(envKey);
              setEditedEnvValue(envValue);
              setEditMode(false);
            }}
          />
          <LightIconButton
            accent={'tertiary'}
            Icon={IconCheck}
            disabled={
              !editedEnvKey.match(/^[a-zA-Z]*$/) ||
              editedEnvKey === '' ||
              editedEnvValue === ''
            }
            onClick={() => {
              onChange(editedEnvKey, editedEnvValue);
              setEditMode(false);
            }}
          />
        </TableCell>
      </StyledEditModeTableRow>
    ) : (
      <StyledTableRow>
        <TableCell>{envKey}</TableCell>
        <TableCell>{envValue}</TableCell>
        <TableCell>
          <Dropdown
            dropdownMenuWidth="100px"
            dropdownId={dropDownId}
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
                    onClick={() => {
                      setEditMode(true);
                    }}
                  />
                  <MenuItem
                    text={'Delete'}
                    LeftIcon={IconTrash}
                    onClick={() => {
                      onDelete();
                      closeDropdown();
                    }}
                  />
                </DropdownMenuItemsContainer>
              </DropdownMenu>
            }
            dropdownHotkeyScope={{
              scope: dropDownId,
            }}
          />
        </TableCell>
      </StyledTableRow>
    );
  };
