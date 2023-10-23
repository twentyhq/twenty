import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconChevronDown } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

import { SelectHotkeyScope } from '../types/SelectHotkeyScope';

export type SelectProps<Value extends string | number> = {
  dropdownScopeId: string;
  onChange: (value: Value) => void;
  options: { value: Value; label: string; Icon?: IconComponent }[];
  value?: Value;
};

const StyledContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const Select = <Value extends string | number>({
  dropdownScopeId,
  onChange,
  options,
  value,
}: SelectProps<Value>) => {
  const theme = useTheme();
  const selectedOption =
    options.find(({ value: key }) => key === value) || options[0];

  const { closeDropdown } = useDropdown({ dropdownScopeId });

  return (
    <DropdownScope dropdownScopeId={dropdownScopeId}>
      <Dropdown
        dropdownMenuWidth={176}
        dropdownPlacement="bottom-start"
        clickableComponent={
          <StyledContainer>
            <StyledLabel>
              {!!selectedOption.Icon && (
                <selectedOption.Icon
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              )}
              {selectedOption.label}
            </StyledLabel>
            <IconChevronDown
              color={theme.font.color.tertiary}
              size={theme.icon.size.md}
            />
          </StyledContainer>
        }
        dropdownComponents={
          <DropdownMenuItemsContainer>
            {options.map((option) => (
              <MenuItem
                key={option.value}
                LeftIcon={option.Icon}
                text={option.label}
                onClick={() => {
                  onChange(option.value);
                  closeDropdown();
                }}
              />
            ))}
          </DropdownMenuItemsContainer>
        }
        dropdownHotkeyScope={{ scope: SelectHotkeyScope.Select }}
      />
    </DropdownScope>
  );
};
