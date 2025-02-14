import { EnvironmentVariable } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTabEnvironmentVariablesSection';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useState } from 'react';
import {
  IconCheck,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconX,
  LightIconButton,
  MenuItem,
  OverflowingTextWithTooltip,
} from 'twenty-ui';

const StyledEditModeTableRow = styled(TableRow)`
  grid-template-columns: 180px auto 56px;
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 180px 300px 32px;
`;

export const SettingsServerlessFunctionTabEnvironmentVariableTableRow = ({
  envVariable,
  onChange,
  onDelete,
  initialEditMode = false,
}: {
  envVariable: EnvironmentVariable;
  onChange: (newEnvVariable: EnvironmentVariable) => void;
  onDelete: () => void;
  initialEditMode?: boolean;
}) => {
  const [editedEnvVariable, setEditedEnvVariable] = useState(envVariable);
  const [editMode, setEditMode] = useState(initialEditMode);
  const dropDownId = `settings-environment-variable-dropdown-${envVariable.id}`;
  const { closeDropdown } = useDropdown(dropDownId);

  return editMode ? (
    <StyledEditModeTableRow>
      <TableCell>
        <TextInputV2
          autoFocus
          value={editedEnvVariable.key}
          onChange={(newKey) =>
            setEditedEnvVariable({ ...editedEnvVariable, key: newKey })
          }
          placeholder="Name"
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextInputV2
          value={editedEnvVariable.value}
          onChange={(newValue) =>
            setEditedEnvVariable({ ...editedEnvVariable, value: newValue })
          }
          placeholder="Value"
          fullWidth
        />
      </TableCell>
      <TableCell>
        <LightIconButton
          accent={'tertiary'}
          Icon={IconX}
          onClick={() => {
            if (envVariable.key === '' && envVariable.value === '') {
              onDelete();
            }
            setEditedEnvVariable(envVariable);
            setEditMode(false);
          }}
        />
        <LightIconButton
          accent={'tertiary'}
          Icon={IconCheck}
          disabled={
            editedEnvVariable.key === '' || editedEnvVariable.value === ''
          }
          onClick={() => {
            onChange(editedEnvVariable);
            setEditMode(false);
          }}
        />
      </TableCell>
    </StyledEditModeTableRow>
  ) : (
    <StyledTableRow onClick={() => setEditMode(true)}>
      <TableCell>
        <OverflowingTextWithTooltip text={envVariable.key} />
      </TableCell>
      <TableCell>
        <OverflowingTextWithTooltip text={envVariable.value} />
      </TableCell>
      <TableCell>
        <Dropdown
          dropdownId={dropDownId}
          clickableComponent={
            <LightIconButton
              aria-label="Env Variable Options"
              Icon={IconDotsVertical}
              accent="tertiary"
            />
          }
          dropdownComponents={
            <DropdownMenuItemsContainer>
              <MenuItem
                text={'Edit'}
                LeftIcon={IconPencil}
                onClick={() => {
                  setEditMode(true);
                  closeDropdown();
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
          }
          dropdownHotkeyScope={{ scope: dropDownId }}
        />
      </TableCell>
    </StyledTableRow>
  );
};
