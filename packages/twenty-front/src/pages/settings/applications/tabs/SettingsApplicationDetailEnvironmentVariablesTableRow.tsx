import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useState } from 'react';
import {
  AppTooltip,
  IconCheck,
  IconDotsVertical,
  IconInfoCircle,
  IconPencil,
  OverflowingTextWithTooltip,
  TooltipDelay,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';

export const StyledApplicationEnvironmentVariableTableRow = styled(TableRow)`
  grid-template-columns: 100px auto 56px 56px;
`;

export type EnvironmentVariable = {
  key: string;
  value: string;
  description: string;
};

export const SettingsApplicationDetailEnvironmentVariablesTableRow = ({
  envVariable,
  onChange,
  readonly,
}: {
  envVariable: EnvironmentVariable;
  onChange: (
    newEnvVariable: Pick<EnvironmentVariable, 'key' | 'value'>,
  ) => void;
  readonly?: boolean;
}) => {
  const [editedEnvVariable, setEditedEnvVariable] = useState(envVariable);
  const [editMode, setEditMode] = useState(false);
  const dropDownId = `settings-environment-variable-dropdown-${envVariable.key}`;
  const { closeDropdown } = useCloseDropdown();
  const theme = useTheme();
  const { t } = useLingui();

  const description =
    envVariable.description.length > 0
      ? envVariable.description
      : t`No description`;

  const InfoTableCell = (
    <TableCell>
      <IconInfoCircle
        id={`info-circle-id-description-${envVariable.key}`}
        size={theme.icon.size.md}
        color={theme.font.color.tertiary}
        style={{ outline: 'none' }}
      />
      <AppTooltip
        anchorSelect={`#info-circle-id-description-${envVariable.key}`}
        content={description}
        offset={5}
        noArrow
        place="bottom"
        positionStrategy="fixed"
        delay={TooltipDelay.shortDelay}
      />
    </TableCell>
  );

  return editMode && !readonly ? (
    <StyledApplicationEnvironmentVariableTableRow>
      <TableCell>
        <OverflowingTextWithTooltip text={envVariable.key} />
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
      {InfoTableCell}
      <TableCell>
        <LightIconButton
          accent="tertiary"
          Icon={IconCheck}
          disabled={editedEnvVariable.key === ''}
          onClick={() => {
            onChange(editedEnvVariable);
            setEditMode(false);
          }}
        />
      </TableCell>
    </StyledApplicationEnvironmentVariableTableRow>
  ) : (
    <StyledApplicationEnvironmentVariableTableRow
      onClick={() => setEditMode(true)}
    >
      <TableCell>
        <OverflowingTextWithTooltip text={editedEnvVariable.key} />
      </TableCell>
      <TableCell>
        <OverflowingTextWithTooltip text={editedEnvVariable.value} />
      </TableCell>
      {InfoTableCell}
      <TableCell>
        {!readonly && (
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
                </DropdownMenuItemsContainer>
              </DropdownContent>
            }
          />
        )}
      </TableCell>
    </StyledApplicationEnvironmentVariableTableRow>
  );
};
