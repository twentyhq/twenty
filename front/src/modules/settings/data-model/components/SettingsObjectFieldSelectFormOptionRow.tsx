import { useMemo } from 'react';
import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { IconDotsVertical, IconTrash } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { ThemeColor } from '@/ui/theme/constants/colors';

export type SettingsObjectFieldSelectFormOption = {
  color: ThemeColor;
  text: string;
};

type SettingsObjectFieldSelectFormOptionRowProps = {
  onChange: (value: SettingsObjectFieldSelectFormOption) => void;
  onRemove?: () => void;
  value: SettingsObjectFieldSelectFormOption;
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
  onChange,
  onRemove,
  value,
}: SettingsObjectFieldSelectFormOptionRowProps) => {
  const dropdownScopeId = useMemo(() => `select-field-option-row-${v4()}`, []);

  const { closeDropdown } = useDropdown({ dropdownScopeId });

  return (
    <StyledRow>
      <StyledOptionInput
        value={value.text}
        onChange={(text) => onChange({ ...value, text })}
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
