import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import {
  IconCheck,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconX,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import type { ApplicationVariable } from '~/generated/graphql';

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
  envVariable: ApplicationVariable;
  onChange: (newEnvVariable: ApplicationVariable) => void;
  onDelete: () => void;
  initialEditMode?: boolean;
}) => {
  const [editedEnvVariable, setEditedEnvVariable] = useState(envVariable);
  const [editMode, setEditMode] = useState(initialEditMode);
  const dropDownId = `settings-environment-variable-dropdown-${envVariable.id}`;
  const { closeDropdown } = useCloseDropdown();

  return editMode ? (
    <StyledEditModeTableRow>
      <TableCell>
        <TextInput
          autoFocus
          value={editedEnvVariable.key}
          onChange={(newKey) =>
            setEditedEnvVariable({ ...editedEnvVariable, key: newKey })
          }
          placeholder={t`Name`}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextInput
          value={editedEnvVariable.value}
          onChange={(newValue) =>
            setEditedEnvVariable({ ...editedEnvVariable, value: newValue })
          }
          placeholder={t`Value`}
          fullWidth
        />
      </TableCell>
      <TableCell>
        <LightIconButton
          accent="tertiary"
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
          accent="tertiary"
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
              aria-label={t`Env Variable Options`}
              Icon={IconDotsVertical}
              accent="tertiary"
            />
          }
          dropdownComponents={
            <DropdownContent>
              <DropdownMenuItemsContainer>
                <MenuItem
                  text={t`Edit`}
                  LeftIcon={IconPencil}
                  onClick={() => {
                    setEditMode(true);
                    closeDropdown(dropDownId);
                  }}
                />
                <MenuItem
                  text={t`Delete`}
                  LeftIcon={IconTrash}
                  onClick={() => {
                    onDelete();
                    closeDropdown(dropDownId);
                  }}
                />
              </DropdownMenuItemsContainer>
            </DropdownContent>
          }
        />
      </TableCell>
    </StyledTableRow>
  );
};
