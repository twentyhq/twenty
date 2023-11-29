import { useMemo } from 'react';
import styled from '@emotion/styled';
import { v4 } from 'uuid';

import {
  IconCheck,
  IconDotsVertical,
  IconTrash,
  IconX,
} from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

import { SettingsObjectFieldSelectFormOption } from '../types/SettingsObjectFieldSelectFormOption';

type SettingsObjectFieldSelectFormOptionRowProps = {
  isDefault?: boolean;
  onChange: (value: SettingsObjectFieldSelectFormOption) => void;
  onRemove?: () => void;
  option: SettingsObjectFieldSelectFormOption;
};

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(1)} 0;
`;

const StyledOptionInput = styled(TextInput)`
  flex: 1 0 auto;
  margin-right: ${({ theme }) => theme.spacing(2)};

  & input {
    height: ${({ theme }) => theme.spacing(2)};
  }
`;

export const SettingsObjectFieldSelectFormOptionRow = ({
  isDefault,
  onChange,
  onRemove,
  option,
}: SettingsObjectFieldSelectFormOptionRowProps) => {
  const dropdownScopeId = useMemo(() => `select-field-option-row-${v4()}`, []);

  const { closeDropdown } = useDropdown({ dropdownScopeId });

  return (
    <StyledRow>
      <StyledOptionInput
        value={option.label}
        onChange={(label) => onChange({ ...option, label })}
        RightIcon={isDefault ? IconCheck : undefined}
      />
      <DropdownScope dropdownScopeId={dropdownScopeId}>
        <Dropdown
          dropdownPlacement="right-start"
          dropdownHotkeyScope={{
            scope: dropdownScopeId,
          }}
          clickableComponent={<LightIconButton Icon={IconDotsVertical} />}
          dropdownComponents={
            <DropdownMenu>
              <DropdownMenuItemsContainer>
                {isDefault ? (
                  <MenuItem
                    LeftIcon={IconX}
                    text="Remove as default"
                    onClick={() => {
                      onChange({ ...option, isDefault: false });
                      closeDropdown();
                    }}
                  />
                ) : (
                  <MenuItem
                    LeftIcon={IconCheck}
                    text="Set as default"
                    onClick={() => {
                      onChange({ ...option, isDefault: true });
                      closeDropdown();
                    }}
                  />
                )}
                {!!onRemove && (
                  <MenuItem
                    accent="danger"
                    LeftIcon={IconTrash}
                    text="Remove option"
                    onClick={() => {
                      onRemove();
                      closeDropdown();
                    }}
                  />
                )}
              </DropdownMenuItemsContainer>
            </DropdownMenu>
          }
        />
      </DropdownScope>
    </StyledRow>
  );
};
